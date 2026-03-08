# Installation Guide

Follow these steps to set up the NeuroForms project locally.

## Prerequisites

- Python 3.12 or higher
- Node.js (v18 or higher recommended)
- npm or yarn

## Backend Setup

1. **Navigate to the root directory:**
   ```bash
   cd Neuroforms/NeuroForms
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt  # Or use uv/poetry if configured
   # Since we use pyproject.toml:
   pip install .
   ```

4. **Run database migrations:**
   ```bash
   cd forms_project
   python manage.py migrate
   ```

5. **Start the Django development server:**
   ```bash
   python manage.py runserver
   ```
   The backend API will be available at `http://localhost:8000/`.

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd Neuroforms/NeuroForms/frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:5173/` or `http://localhost:8080/` (depending on Vite configuration).

## Environment Variables

Make sure to configure the `.env` files if required by the application. By default, the frontend relies on the backend running at standard localhost ports.
