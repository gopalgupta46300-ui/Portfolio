# Architecture notes

The project is split into a static frontend and a Flask backend. The frontend is a portfolio site and admin portal written in plain HTML/CSS/JavaScript. The backend is a lightweight Python service that exposes public endpoints for reading portfolio content and protected endpoints for admin actions.

## Current structure

- `frontend/`: public portfolio UI and admin pages
- `backend/`: Flask API, Supabase access layer, and deployment config

## Public flow

1. The browser loads `frontend/index.html`.
2. `frontend/js/main.js` fetches `/api/bio` and `/api/projects`.
3. `backend/public.py` queries Supabase with the public client.
4. The response is rendered on the page.

## Admin flow

1. The admin signs in through `frontend/admin/login.html`.
2. `backend/admin.py` validates credentials through Supabase Auth.
3. A session cookie is created for the authenticated admin user.
4. `frontend/admin/dashboard.js` sends authorized admin requests using `credentials: "include"` and a custom `X-Requested-With: portfolio-admin` header.
5. The backend updates the bio or project records in Supabase using the service-role client.

## RLS requirement

The public client must be able to read:

- `bio_descriptions` rows used on the landing page
- `projects` rows where `published = true`

The admin client can be used for write operations when required by the security model.
