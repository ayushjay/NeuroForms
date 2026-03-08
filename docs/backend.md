# Backend Documentation

The backend is a Django project (`forms_project`) providing a RESTful API powered by Django REST Framework (DRF).

## Project Structure

- **`forms_project/`**: Main Django configuration directory containing `settings.py`, `urls.py`, and WSGI/ASGI configurations.
- **`my_auth/`**: The primary Django application handling user authentication, form models, and API views.

## Database Models

The core data models are defined in `my_auth/models.py`:

- **`Form`**: Represents a custom form or survey. Contains attributes like `title`, `description`, `creator` (ForeignKey to Django `User`), `is_active`, and requirements like `require_email`.
- **`Question`**: Represents a field within a form. Supports various `answer_type`s (e.g., paragraph, mcq, checkbox, dropdown, linear scale). Includes properties for optional/required and ordering.
- **`Option`**: Represents selectable choices for MCQ, checkboxes, or dropdown questions. Also supports scoring (`score`) for psychological scales.
- **`Section`**: Allows dividing forms into different logical sections (optional).
- **`Response`**: Represents a completed submission of a form, tracking the submitter's `email` (if required) and submission timestamp.
- **`Answer`**: Represents the value provided for a specific `Question` within a `Response`.
- **`ShortLink`**: A utility model used to generate and store shortened URLs for sharing forms.

## Authentication and Security

The backend uses Django's Session Authentication combined with CSRF protection. API views are protected by DRF's `IsAuthenticated` or `AllowAny` permission classes. A custom cookie-based CSRF token mechanism is employed to securely authorize requests from the React frontend.

## Custom Services

- **Results Calculation**: Logic to compute scores (e.g., for psychological scales) is segregated into `my_auth/services/results.py`.
