import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const SPRING_AUTH_URL = process.env.SPRING_AUTH_URL || "http://localhost:8080/api/auth/login";
const SPRING_REFRESH_URL = process.env.SPRING_REFRESH_URL || "http://localhost:8080/api/auth/refresh";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const res = await fetch(SPRING_AUTH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        // Expecting Spring backend to return something like:
        // { user: { id, name, email }, accessToken, refreshToken, expiresIn }
        const user = {
          ...(data.user || {}),
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        };

        return user;
      },
    }),
    // Google OAuth provider - ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // on initial sign in, the user object returned from authorize() is provided
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.user = {
          id: (user as any).id,
          name: (user as any).name,
          email: (user as any).email,
        };
        token.expiresAt = (user as any).expiresIn
          ? Date.now() + (user as any).expiresIn * 1000
          : undefined;
      }

      // Optionally: refresh token logic when expired (coerce expiresAt to number)
      const expiresAtNum = token.expiresAt ? Number(token.expiresAt) : undefined;
      if (expiresAtNum && Date.now() > expiresAtNum - 60_000) {
        try {
          const r = await fetch(SPRING_REFRESH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
          });
          if (r.ok) {
            const refreshed = await r.json();
            token.accessToken = refreshed.accessToken;
            token.refreshToken = refreshed.refreshToken ?? token.refreshToken;
            token.expiresAt = refreshed.expiresIn
              ? Date.now() + refreshed.expiresIn * 1000
              : token.expiresAt;
          }
        } catch {
          // silent - token will fail next protected call
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});
export { handler as GET, handler as POST }