# Portfolio

A personal portfolio website for Gopal ji Gupta, built as a static frontend + Flask API architecture. The site presents a public portfolio with a bio, skills, projects, and contact details, while an admin dashboard provides authenticated management for the portfolio content.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Architecture and Workflow](#architecture-and-workflow)
- [Testing](#testing)
- [Results and Limitations](#results-and-limitations)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)
- [Author](#author)

## Project Overview

This repository contains a portfolio project designed to showcase an AI/ML and data-focused profile. The public site is a responsive landing page that highlights:

- a personal introduction and bio
- project work and technical focus areas
- data science, AI, and ML skill areas
- contact and social links

The backend is a Python Flask application that exposes a public API for reading portfolio content and an authenticated admin API for updating the bio and managing the visible project list. All dynamic content is stored in Supabase and loaded at runtime.

## Features

- Responsive single-page portfolio built in HTML, CSS, and JavaScript
- Dynamic loading of portfolio projects from a backend API
- Dynamic loading of the public bio text from Supabase
- Admin login flow with session-based authentication
- Admin dashboard for viewing project stats and updating the bio
- CORS configuration for local development and deployment
- Vercel deployment support with URL rewrites
- Support for environment-based configuration and local development mode

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Python 3.10+, Flask, Flask-CORS |
| Environment management | python-dotenv |
| Database | Supabase |
| Authentication | Supabase Auth via Flask backend |
| Hosting/deployment | Vercel |
| Licensing | Apache License 2.0 |

## Project Structure

```text
Portfolio/
├── LICENSE
├── README.md
├── checks.json
├── vercel.json
├── backend/
│   ├── __pycache__/
│   ├── admin.py
│   ├── app.py
│   ├── archi.md
│   ├── public.py
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── services/
│       ├── __pycache__/
│       ├── requirements.txt
│       └── supabase_client.py
├── frontend/
│   ├── admin/
│   │   ├── dashboard.css
│   │   ├── dashboard.html
│   │   ├── dashboard.js
│   │   ├── login.css
│   │   ├── login.html
│   │   └── login.js
│   ├── css/
│   │   └── style.css
│   ├── index.html
│   └── js/
│       └── main.js
└── .gitignore (not shown in repo tree but likely present in the working clone)
```

### Key files

- `backend/app.py`: creates the Flask app, configures CORS, registers blueprints, and sets session cookie behavior
- `backend/public.py`: exposes public-read endpoints such as `/api/bio` and `/api/projects`
- `backend/admin.py`: contains admin authentication and protected routes for reading/updating the bio
- `backend/services/supabase_client.py`: initializes the Supabase client from environment variables
- `frontend/index.html`: public portfolio landing page
- `frontend/admin/login.html` and `frontend/admin/login.js`: admin authentication UI
- `frontend/admin/dashboard.html` and `frontend/admin/dashboard.js`: admin dashboard and bio editing interface
- `vercel.json`: Vercel rewrite and CORS header configuration

## Installation and Setup

### Prerequisites

- Python 3.10 or newer
- pip
- Git
- A Supabase project with the required tables and credentials
- A modern browser

### 1. Clone the repository

```bash
git clone https://github.com/gopalgupta46300-ui/Portfolio.git
cd Portfolio
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file inside the `backend/` directory with the required values. The application reads environment variables using `python-dotenv` and expects a Supabase setup to exist.

## Configuration

The application reads the following environment variables from the backend environment:

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Base URL for your Supabase project |
| `SUPABASE_SECRET_ROLE_KEY` | Yes | Service-role key used by `backend/services/supabase_client.py` |
| `ADMIN_EMAIL` | Yes | Email allowed to sign in to the admin portal |
| `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY` or `SUPABASE_KEY` | Yes | Used during admin sign-in via Supabase Auth |
| `FLASK_SECRET_KEY` or `SECRET_KEY` | Recommended | Secret for Flask sessions |
| `ALLOWED_ORIGINS` | Optional | Additional comma-separated allowed origins for CORS |
| `VERCEL` or `VERCEL_ENV` | Optional | Used to switch cookie security settings for deployment |

Example:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_ROLE_KEY=your_service_role_key
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
ADMIN_EMAIL=admin@example.com
FLASK_SECRET_KEY=change-me
ALLOWED_ORIGINS=http://localhost:8000,https://your-frontend-domain.vercel.app
```

Notes:

- Do not commit real credentials into version control.
- The repository does not include a sample `.env` file; it must be created locally.
- If required Supabase credentials are missing, the backend will fail at import time.

## Running the Project

### Run the backend

From the `backend/` directory:

```bash
source .venv/bin/activate
python app.py
```

This starts the Flask API on the default development server, typically at:

```text
http://localhost:5000
```

### Run the frontend locally

From the repository root:

```bash
cd frontend
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

The frontend JavaScript defaults to the production backend URL when not running on localhost, and uses the local Flask backend automatically when the page is served from `localhost`.

## Usage

### Public portfolio

Open the frontend in a browser to view:

- hero section
- about section
- selected project cards
- contact information

The page fetches content from the backend using these public endpoints:

```text
GET /api/bio
GET /api/projects
```

### Admin dashboard

Open:

```text
http://localhost:8000/admin/login.html
```

Sign in using an authorized admin email and password configured in Supabase Auth. On success, the app redirects to:

```text
http://localhost:8000/admin/dashboard.html
```

The admin dashboard supports:

- viewing the current admin email
- loading bio content from the API
- updating the bio description
- viewing project statistics

## Architecture and Workflow

The project uses a straightforward client-server pattern:

1. The browser loads `frontend/index.html` and JavaScript from `frontend/js/main.js`.
2. The frontend asks the backend for public content via `/api/bio` and `/api/projects`.
3. The Flask backend queries Supabase using the initialized client in `backend/services/supabase_client.py`.
4. The public portfolio is rendered with data returned by the API.
5. The admin portal uses the `/api/admin/*` endpoints for secure login and bio management.
6. Session cookies are used to protect admin routes and enforce access control.

This separation keeps the front-end presentation layer independent from the data layer while still allowing dynamic content updates.

## Testing

No formal automated test suite was found in this repository. The current verification approach is manual:

- start the backend
- confirm the API returns expected JSON from `/api/bio` and `/api/projects`
- open the frontend and verify the public portfolio loads properly
- sign in to the admin portal and confirm that the bio can be updated

If tests are added later, they should be placed alongside the relevant application modules or under a dedicated `tests/` directory.

## Results and Limitations

### Confirmed behaviors

- The repo contains a functioning Flask API structure for public and admin content
- The frontend is a static responsive portfolio and admin portal
- Content is dynamically fetched from Supabase
- The admin dashboard includes a bio editor and project overview UI

### Known limitations

- The repository does not currently include an automated test suite
- The dashboard contains an `Add Project` button, but the form/action is not implemented in the current code
- The public projects list depends on Supabase data being present and correctly structured
- The frontend is deliberately static and does not include a full client-side project management system beyond the current UI shell

## Contribution Guidelines

Contributions are welcome if you want to improve the portfolio or extend the admin features.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes in a focused, well-documented manner.
4. Verify the frontend and backend still run locally.
5. Submit a pull request with a clear description of the change.

Before making changes, ensure that environment values, routes, and Supabase schema expectations remain consistent with the existing code.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Author

This portfolio is authored by Gopal ji Gupta.

You can also see direct contact links and social profiles embedded in the public portfolio page, including the email address and GitHub/LinkedIn links present in `frontend/index.html`.

---

This README was written from the repository source and configuration files currently present in the project.
