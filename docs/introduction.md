# NeuroForms 

## Introduction

NeuroForms is a comprehensive form-building and data collection application. It allows users to quickly create custom forms, surveys, and psychological scales, distribute them via unique links (including shortened URLs), and analyze the responses through a centralized dashboard. The application is built with modern web technologies, providing a seamless user experience for both form creators and respondents.

## Architecture

The project adopts a decoupled client-server architecture:

- **Backend (API Server):** Built with Django and Django REST Framework (DRF). It handles user authentication, form management, data persistence, and API endpoint provisioning. The backend uses a SQLite database by default.
- **Frontend (Client Application):** Built with React, TypeScript, and Vite. It provides an interactive Single Page Application (SPA) for the user interface, utilizing components from Shadcn/UI, Tailwind CSS for styling, and React Query for state management and API data fetching.

The two systems communicate over HTTP via RESTful APIs, with JSON as the primary data exchange format.
