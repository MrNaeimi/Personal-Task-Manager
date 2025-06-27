// frontend/js/auth.js

// Define API base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Make sure this matches your Django backend URL

// Get form and section elements
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const showLoginFormButton = document.getElementById('show-login');
const showSignupFormButton = document.getElementById('show-signup');
const signupFormSection = document.getElementById('signup-form-section');
const loginFormSection = document.getElementById('login-form-section');
const messageDiv = document.getElementById('message');

// Function to show messages to the user
function showMessage(text, type = 'danger') {
    messageDiv.textContent = text;
    messageDiv.className = `mt-3 text-center alert alert-${type}`; // Bootstrap alert classes
    messageDiv.style.display = 'block';
}

// Function to hide messages
function hideMessage() {
    messageDiv.style.display = 'none';
}

// Event listener for showing login form
showLoginFormButton.addEventListener('click', (e) => {
    e.preventDefault();
    signupFormSection.style.display = 'none';
    loginFormSection.style.display = 'block';
    hideMessage(); // Clear any previous messages
});

// Event listener for showing signup form
showSignupFormButton.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormSection.style.display = 'none';
    signupFormSection.style.display = 'block';
    hideMessage(); // Clear any previous messages
});

// Handle Sign Up Form Submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    hideMessage(); // Clear previous messages

    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) { // HTTP status 200-299
            showMessage('Successfull Register', 'success');
            // Auto-login after successful registration (optional, or redirect directly)
            localStorage.setItem('authToken', data.token); // Store the token
            window.location.href = 'dashboard.html'; // Redirect to dashboard
        } else {
            // Handle API errors (e.g., username already taken, invalid password)
            const errorMessages = Object.values(data).flat().join('\n');
            showMessage(`خطا در ثبت‌نام:\n${errorMessages}`);
        }
    } catch (error) {
        console.error('Error during signup:', error);
        showMessage('Bad Connection, Please Try again later.');
    }
});

// Handle Login Form Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    hideMessage(); // Clear previous messages

    const usernameOrEmail = document.getElementById('login-username-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: usernameOrEmail, password }), // API expects 'username' field
        });

        const data = await response.json();

        if (response.ok) { // HTTP status 200-299
            localStorage.setItem('authToken', data.token); // Store the token in local storage
            showMessage('Successfull,Waitting...', 'success');
            window.location.href = 'dashboard.html'; // Redirect to dashboard
        } else {
            showMessage('User Name or Password is wrong.');نا
        }
    } catch (error) {
        console.error('Error during login:', error);
        showMessage('Try Again - Bad Connection');
    }
});