# Portfolio

<p align="center">
  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80" alt="Portfolio Website Banner" width="100%" />
</p>

<p align="center">
  <a href="https://portfolio-frontend-jet-kappa.vercel.app/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Live%20Website-portfolio-frontend--jet--kappa.vercel.app-4A90E2?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Website" />
  </a>
  <img src="https://img.shields.io/badge/Status-In%20Progress-orange?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS%20%7C%20Python-3B82F6?style=for-the-badge" alt="Tech Stack" />
</p>

Website is not complete yet.

A personal portfolio website for Gopal ji Gupta. The project combines a static frontend with a Python Flask API that loads portfolio content from Supabase and powers an admin dashboard for content management.

## Live Demo

Visit the live portfolio here:

- https://portfolio-frontend-jet-kappa.vercel.app/

## Project Status

This project is currently a work in progress. The repository includes the public portfolio UI, backend APIs, and an administrative interface for managing the site content.

## Overview

- Public portfolio website with sections for projects, skills, and contact information
- Flask backend for serving API data
- Supabase integration for content storage and retrieval
- Admin login/dashboard for content updates
- Vercel-ready deployment structure for frontend and backend

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python, Flask
- Database / Content: Supabase
- Hosting: Vercel

## Language Composition

This repository is primarily composed of:

- CSS: 42.4%
- HTML: 27.4%
- JavaScript: 18.1%
- Python: 12.1%

## Repository Structure

```text
Portfolio/
├── LICENSE
├── README.md
├── .gitattributes
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── app.py
│   ├── admin.py
│   ├── public.py
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── vercel.json
│   └── services/
│       └── supabase_client.py
├── frontend/
│   ├── vercel.json
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── admin/
│       ├── dashboard.css
│       ├── dashboard.html
│       ├── dashboard.js
│       ├── login.css
│       ├── login.html
│       └── login.js
├── checks.json
└── .github/
```

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run the API locally:

```bash
python app.py
```

### Frontend

```bash
cd frontend
python -m http.server 3000
```

Open the site in a browser:

```text
http://localhost:3000
```

## Environment Variables

Create a `backend/.env` file with the following values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_ROLE_KEY=your_service_role_key
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
ADMIN_EMAIL=admin@example.com
FLASK_SECRET_KEY=replace-with-a-random-secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

These variables are used for:

- Supabase connection (`SUPABASE_URL`)
- admin operations (`SUPABASE_SECRET_ROLE_KEY`)
- public reads (`SUPABASE_PUBLISHABLE_KEY`)
- session protection and admin auth (`FLASK_SECRET_KEY`)
- allowed frontend/backend origins (`ALLOWED_ORIGINS`)

## Deployment

### Backend (Vercel)

- Root Directory: `backend`
- Framework: `Other`
- Build Command: empty
- Output Directory: empty

Backend config is defined in `backend/vercel.json`:

```json
{"version": 2, "builds": [{"src": "app.py", "use": "@vercel/python"}], "routes": [{"src": "/(.*)", "dest": "app.py"}]}
```

Set these environment variables in Vercel Production:

- `SUPABASE_URL`
- `SUPABASE_SECRET_ROLE_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `ADMIN_EMAIL`
- `FLASK_SECRET_KEY`
- `ALLOWED_ORIGINS`

### Frontend (Vercel)

- Root Directory: `frontend`
- Framework: `Other`
- Build Command: empty
- Output Directory: empty

Frontend config is in `frontend/vercel.json`:

```json
{"rewrites": [{"source": "/api/:path*", "destination": "https://portfolio-team-vibe5.vercel.app/api/:path*"}]}
```

## Troubleshooting

### CORS issues

- Ensure the frontend project rewrites `/api` requests to the backend Vercel domain.
- Keep Flask-CORS as the single source of CORS headers.
- Confirm the browser origin is present in `ALLOWED_ORIGINS`.

### 500 FUNCTION_INVOCATION_FAILED

- Check backend logs in Vercel.
- Ensure `FLASK_SECRET_KEY` is set in production.
- Confirm the deployment root directory is `backend` and the app entry is `app.py`.

### Admin login issues

- Confirm `ADMIN_EMAIL` matches the Supabase Auth user.
- Check that the configured Supabase publishable key and URL are valid.
- Verify the browser includes cookies and the `credentials: "include"` fetch option.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
