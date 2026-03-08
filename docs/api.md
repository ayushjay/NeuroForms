# API Documentation

The API routes are prefixed mostly with `/api/` and defined in `my_auth/urls.py`.

## Authentication Endpoints

- `GET /api/csrf/`: Returns a CSRF token for the client application.
- `GET /api/me/`: Returns the currently authenticated user's details.
- `POST /api/login/`: Accepts `email` and `password` to authenticate a user and establish a session.
- `POST /api/signup/`: Registers a new user with `username`, `email`, `password`, `first_name`, and `last_name`.
- `POST /api/logout/`: Clears the user's session.

## Dashboard & Form Management

These endpoints require `IsAuthenticated`.

- `GET /api/dashboard/`: Returns aggregate statistics (total forms, active forms, total responses) for the current user.
- `GET /api/dashboard/forms/`: Lists all forms created by the authenticated user.
- `POST /api/dashboard/forms/create/`: Creates a new form (`title`, `description`).
- `GET /api/dashboard/forms/<pk>/edit/`: Retrieves detailed structure of a specific form including questions and options for editing.
- `DELETE /api/dashboard/forms/<pk>/delete/`: Deletes a form.
- `POST /api/dashboard/forms/<pk>/questions/add/`: Appends a new question to a form.
- `POST /api/dashboard/questions/<pk>/options/add/`: Appends a new option to a specific question.
- `POST /api/dashboard/forms/<pk>/shorten/`: Generates a short shareable URL for the given form.

## Form Rendering & Submission

These endpoints are accessible to `AllowAny` respondents.

- `GET /api/forms/<pk>/`: Retrieves the public structure of a form to be filled by respondents.
- `POST /api/forms/<pk>/submit/`: Accepts and saves a respondent's answers to the form.

## Form Results

- `GET /api/forms/<pk>/results/`: Retrieves aggregated and calculated results (including scored items) for a given form. Requires `IsAuthenticated`.

## Link Redirection

- `GET /s/<short_code>/`: Redirects a shortened URL to the full form submission page.
