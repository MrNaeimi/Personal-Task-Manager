Personal Task Manager Application
This is a full-stack web application designed for efficient personal task management. It provides users with a comprehensive set of tools to organize their daily tasks, track progress, and ensure timely completion.

Key Features
User Authentication: Secure registration, login, and logout functionalities with token-based authentication.

Task Management (CRUD): Users can create, view, update (including marking as DONE), and delete their personal tasks.

Task Prioritization & Status: Tasks can be assigned a priority (NOW, THEN) and status (TODO, In Progress, DONE). Tasks are dynamically separated into "To Do & In Progress" and "DONE" sections for clear organization.

Date Tracking: Automatic timestamps for task creation and completion, with an optional due date.

Intuitive Interface: A clean and responsive user interface built with Bootstrap 5.

Technologies Used
Backend: Python, Django, Django REST Framework (DRF)

Database: PostgreSQL

Frontend: HTML5, CSS3, Bootstrap 5, Pure JavaScript (Vanilla JS)

How to Run Locally
Follow these steps to set up and run the application on your local machine:

Clone the repository:

git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME # Replace with your actual repository name (e.g., Personal-Task-Manager)

Create and activate a Python virtual environment:

python3 -m venv venv
source venv/bin/activate

Install project dependencies:

pip install -r requirements.txt

Set up PostgreSQL database:

Ensure your PostgreSQL server is running.

Connect to PostgreSQL (e.g., via psql command-line client or pgAdmin GUI) and create a new database and a dedicated user for your project. Remember your database name, username, and password.

CREATE DATABASE your_db_name; -- e.g., task_manager_db
CREATE USER your_db_user WITH PASSWORD 'your_secure_db_password';
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_db_user;

Configure Django settings:

Open task_manager_project/settings.py.

Update the DATABASES section with the PostgreSQL credentials you just created.

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'your_db_name', # e.g., task_manager_db
        'USER': 'your_db_user',
        'PASSWORD': 'your_secure_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

Ensure DEBUG = True for local development.

Make sure INSTALLED_APPS includes: 'tasks', 'rest_framework', 'rest_framework.authtoken', and 'corsheaders'.

Add CORS_ALLOW_ALL_ORIGINS = True (or specify CORS_ALLOWED_ORIGINS = ["http://127.0.0.1:5500"] if using VS Code Live Server) for local frontend testing.

Apply database migrations:

python3 manage.py migrate

Create an administrative superuser (optional, for Django admin panel access):

python3 manage.py createsuperuser

Run the Django backend server:

python3 manage.py runserver

The backend API will be available at http://127.0.0.1:8000/api/. Keep this terminal running.

Serve the frontend:

Open frontend/index.html in your web browser. For local development, it's recommended to use VS Code's "Live Server" extension.

Right-click frontend/index.html in VS Code's Explorer and select Open with Live Server.

The frontend will typically open on http://127.0.0.1:5500/frontend/index.html.


Design and Architectural Choices
Django REST Framework: Chosen for its robust features and efficiency in building RESTful APIs, providing seamless data exchange with the frontend. It offers strong authentication mechanisms and powerful serialization.

PostgreSQL: Selected for its reliability, data integrity, and scalability, making it a professional choice for managing structured task data.

Vanilla JavaScript Frontend: Opted for a pure JavaScript implementation to demonstrate fundamental web development skills, efficient DOM manipulation, and direct API interaction without relying on complex frontend frameworks. This showcases a strong understanding of core web technologies. Bootstrap ensured rapid, responsive UI development.

Token-Based Authentication: Implemented for secure, stateless API communication, providing a modern and efficient authentication flow between the frontend and backend.

Separated Task Views: Tasks are logically divided into "To Do & In Progress" and "DONE" sections, providing a clear and updated overview for the user, enhancing usability.

Development Insights & Learning
This project was a significant learning experience, particularly in integrating a Django REST API with a pure JavaScript frontend from scratch. Key challenges encountered and the solutions implemented include:

Environment Setup & PATH Resolution: Successfully navigating complex Python virtual environment and PATH issues on macOS. This involved aggressive troubleshooting, explicit venv creation, and ensuring the correct Python interpreter was used by both the shell and the IDE (VS Code). This deepened my understanding of Python environment management.

API Integration & Authentication: Implementing secure and efficient fetch API calls for all CRUD operations and authentication. This included correctly handling authentication tokens, managing POST and PUT requests, and parsing API responses for success or error feedback.

Frontend Dynamic Rendering: Developing JavaScript logic to dynamically render, update, and sort task lists based on real-time API responses, ensuring a smooth and responsive user experience without full page reloads.

Error Handling: Implementing robust error handling on both the backend (Django) to provide meaningful API responses and on the frontend (JavaScript) to display user-friendly alerts and console logs for debugging.

Collaborative Development: This project was developed with significant assistance from Google's Gemini Large Language Model. Gemini provided foundational code structures, guidance on complex integrations, and extensive troubleshooting support for persistent environmental and logic issues. My role focused on defining the core requirements, active debugging and problem-solving alongside Gemini's suggestions, customizing UI/UX elements, and ensuring overall project cohesion and final delivery. This transparent collaborative approach allowed for a rapid and efficient development cycle while focusing on understanding underlying principles.

Future Enhancements
Implement more advanced calendar views or timeline visualizations for tasks.

Add features for task categorization, tagging, or sub-tasks.

Introduce recurring task functionality for repetitive tasks.

Enhance user profiles and settings management.

Explore real-time updates using WebSockets for multi-device synchronization.

Implement search and more advanced filtering options for tasks.

Developed by Mohammadreza Naeimi
www.linkedin.com/in/mrnaeimi
