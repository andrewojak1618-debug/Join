# Join

Join is a learning project for a Kanban project management tool.

## Firebase setup

The app expects a local Firebase web config file at:

```text
components/js/firebase-config.js
```

This file is intentionally ignored by Git. To run Firebase features locally,
copy the example file:

```powershell
copy components\js\firebase-config.example.js components\js\firebase-config.js
```

Then replace the placeholder values in `firebase-config.js` with the Firebase
web app config from the project.

Do not commit private credentials, service account files, passwords, API
secrets, or admin keys to this repository.
