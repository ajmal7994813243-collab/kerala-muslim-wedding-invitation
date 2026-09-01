# Kerala Muslim Wedding Invitation

Production-oriented Next.js + Firebase personalized wedding invitation app.

## Features
- Admin-only Firebase Authentication
- Token-only guest invitations (no guest login)
- Firestore-backed wedding draft
- Immutable WeddingVersion snapshots
- Guest-specific invitations
- RSVP and open tracking
- Firebase Storage-ready media architecture

## Setup
1. Create a Firebase project.
2. Enable Authentication > Email/Password.
3. Create Firestore Database.
4. Enable Storage.
5. Create a web app and copy its client config into `.env.local`.
6. Create a service account and put project ID, client email and private key in `.env.local`.
7. Create the first admin Firebase Auth user, then create `admins/{uid}` in Firestore with `{role:"admin"}`.
8. `npm install`
9. `npm run typecheck`
10. `npm run build`
11. `npm run dev`

## Important architecture
Editable wedding data lives in `weddings/main`. Clicking Create New Version copies the draft into `weddings/main/versions/{versionId}`. Each invitation stores the exact `versionId` it was issued with. Therefore editing the draft later does not mutate old invitations.

## Deployment
Deploy the Next.js app to Vercel or another Node-compatible host. Add all environment variables from `.env.example`. If using Firebase Storage/Firestore, deploy rules with Firebase CLI.

## Production hardening
For a public commercial launch, tighten Firestore public-read patterns further by serving invitation data through server routes only, add rate limiting/CAPTCHA to RSVP, configure App Check, and use a dedicated admin custom claim or admin collection with least privilege.
