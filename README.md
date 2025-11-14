## Trip Planner

This app will be used for a user who would like to plan a year of travel. 
It serves as a collaborative trip planner, combining itinerary management, budgeting, and scheduling in one interface.
It should contain everything useful for a general trip with friends or family.
These include:
- Calendar to:
    - See trips and free days
- Trips with:
    - Cities/Countries
    - Activities with tags, priority rating
    - Itinerary view
        - Can have activity items or grouped activity items (options)
        - Timeline or list-based UI for day-by-day planning.
        - Quick access to accommodation, transport, and scheduled activities.
        - Editable with drag-and-drop or inline editing.
    - Route calculation
    - Lodging
    - Transport
    - Cost overview+specifics
    - Food
    - Integration w google maps
    - Summarisation of menu, reviews

## Usage
`npm run dev`
visit http://localhost:3000

## Authentication (NextAuth + Spring backend)

This project uses NextAuth for authentication. It is configured to support two providers:
- Credentials (username/password) which delegates authentication to a Spring backend API.
- Google OAuth for social sign-in.

Required environment variables

```
NEXTAUTH_SECRET=your_nextauth_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SPRING_AUTH_URL=http://localhost:8080/api/auth/login
SPRING_REFRESH_URL=http://localhost:8080/api/auth/refresh
```

Notes

- Ensure `SPRING_AUTH_URL` returns JSON in the form `{ user: { id, name, email }, accessToken, refreshToken, expiresIn }` or adjust `app/api/auth/[...nextauth]/route.ts` to match your backend's shape.
- `SPRING_REFRESH_URL` is used by the JWT callback to refresh access tokens when they near expiry.
- Set `NEXTAUTH_SECRET` for secure JWT/session signing in production.
- For Google OAuth, configure an OAuth client in Google Cloud Console and set the redirect URI to `https://<your-domain>/api/auth/callback/google` (or `http://localhost:3000/api/auth/callback/google` for local testing).

Quick local dev

1. copy `.env.local.example` (if you have one) to `.env.local` or create a `.env.local` file at the repo root.
2. Add the variables above.
3. Run the app:

```
npm run dev
```

Then visit `http://localhost:3000` and try signing in via the credentials form or Google.