# Portfolio

A personal portfolio website for Gopal ji Gupta. The site combines a static frontend with a Python Flask API and Supabase-backed data layer. The public portfolio loads the bio and published projects from the backend, while the admin dashboard provides authenticated access to update the bio and manage project content.

## Table of Contents

- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Project Overview

This repository contains a personal portfolio site with two deployment targets:

- a static frontend deployed as a separate Vercel project
- a Flask API backend deployed as a second Vercel project

The public frontend presents the portfolio landing page, skills, projects, about content, and contact information. Dynamic content is retrieved from the backend using REST endpoints. The backend reads from Supabase and exposes a small auth-protected admin API for updating the site content.

## Folder Structure

```text
Portfolio/
├── LICENSE
├── README.md
├── .gitattributes
├── .gitignore
├── backend/
│   ├── app.py
│   ├── admin.py
│   ├── archi.md
│   ├── public.py
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── vercel.json
│   └── services/
│       ├── supabase_client.py
│       └── requirements.txt   # Deprecated; kept only for manual cleanup.
├── frontend/
│   ├── index.html
│   ├── vercel.json
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
├── vercel.json   # legacy file kept only until manual Git cleanup is completed
└── checks.json
```

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/gopalgupta46300-ui/Portfolio.git
cd Portfolio
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run the backend locally on port 5000:

```bash
python app.py
```

The API will be available at:

```text
http://localhost:5000
```

### 3. Frontend setup

Serve the frontend locally on port 3000:

```bash
cd ../frontend
python -m http.server 3000
```

Open:

```text
http://localhost:3000
```

The frontend JavaScript keeps a localhost backend fallback for local development and uses relative `/api/...` paths in production.

## Environment Variables

Create a `.env` file in the `backend/` directory. Required values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_ROLE_KEY=your_service_role_key
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
ADMIN_EMAIL=admin@example.com
FLASK_SECRET_KEY=replace-with-a-long-random-secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

Notes:

- `SUPABASE_SECRET_ROLE_KEY` is used only by the admin client
- `SUPABASE_PUBLISHABLE_KEY` is used by the public client and must be allowed by Supabase Row Level Security (RLS)
- `ALLOWED_ORIGINS` is optional in local development, but it is the main source of trusted frontend origins in production
- Do not commit real secrets or `.env` files to the repository

## Vercel Deployment

### Backend project

Settings:

- Root Directory: `backend`
- Framework: `Other`
- Build Command: leave empty
- Output Directory: leave empty
- Runtime: Python

Backend file:

```json
{"version": 2, "builds": [{"src": "app.py", "use": "@vercel/python"}], "routes": [{"src": "/(.*)", "dest": "app.py"}]}
```

Set the following env vars in Vercel for the backend project:

- `SUPABASE_URL`
- `SUPABASE_SECRET_ROLE_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `ADMIN_EMAIL`
- `FLASK_SECRET_KEY`
- `ALLOWED_ORIGINS`

### Frontend project

Settings:

- Root Directory: `frontend`
- Framework: `Other`
- Build Command: leave empty
- Output Directory: leave empty

Frontend file:

```json
{"rewrites": [{"source": "/api/:path*", "destination": "https://portfolio-team-vibe5.vercel.app/api/:path*"}]}
```

This makes browser requests same-origin for the API and allows the admin session cookie to be treated as first-party.

## Usage

### Public route

The main portfolio page loads:

- `/api/bio`
- `/api/projects`

These are public routes and should respect Supabase RLS rules for reading `bio_descriptions` and published `projects` rows.

### Admin dashboard

Open the admin portal and sign in with the configured admin email and password. The dashboard can:

- load the current bio
- update the bio text
- list project records
- create, edit, and delete project rows

The admin routes require an authenticated session plus the `X-Requested-With: portfolio-admin` header on state-changing requests.

## Troubleshooting

### CORS errors

- Ensure the frontend Vercel project rewrites `/api/*` to the backend domain
- Keep Flask-CORS as the only source of CORS headers
- Do not add a `headers` block to the root Vercel config
- Verify the runtime origin is in `ALLOWED_ORIGINS`

### Admin login fails

- Confirm `ADMIN_EMAIL`, `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY` are set
- Ensure the Supabase Auth user exists and matches the configured admin email
- Check the backend logs for detailed authentication errors

### Project content missing

- Validate that the `projects` table exists in Supabase
- Ensure the rows are `published = true` for public display
- Confirm the public client has permission to read those rows through RLS

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
