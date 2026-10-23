# Portfolio

A personal portfolio website for Gopal ji Gupta. The project combines a static frontend with a Python Flask API that loads data from Supabase. The public portfolio reads published project information and a bio description from the backend, while the admin dashboard lets an authenticated user update that content.

## Table of Contents
- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Project Overview

This repository contains a personal portfolio site built as a static frontend and a lightweight Flask backend. The public site presents a portfolio, skills, project highlights, and contact information. The backend exposes public read endpoints and a protected admin API for editing content. Data is stored in Supabase and loaded dynamically at runtime.

## Folder Structure

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
└── checks.json
```

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Then run the API on port 5000:

```bash
python app.py
```

### Frontend

```bash
cd frontend
python -m http.server 3000
```

Access the site at:

```text
http://localhost:3000
```

## Environment Variables

Create a `backend/.env` file and add values like:

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
- session protection and admin authentication (`FLASK_SECRET_KEY`)
- local and deployed CORS configuration (`ALLOWED_ORIGINS`)

## Vercel Deployment

### Backend project
- Root Directory: `backend`
- Framework: `Other`
- Build Command: empty
- Output Directory: empty

Backend config is in `backend/vercel.json`:

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

### Frontend project
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
- Check the backend logs in Vercel.
- Ensure `FLASK_SECRET_KEY` is set in Production.
- Confirm the deployment root directory is `backend` and the app entry is `app.py`.

### Admin login issues
- Confirm `ADMIN_EMAIL` matches the Supabase Auth user.
- Check that the configured Supabase publishable key and URL are valid.
- Verify the browser includes cookies and the `credentials: "include"` fetch option.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
