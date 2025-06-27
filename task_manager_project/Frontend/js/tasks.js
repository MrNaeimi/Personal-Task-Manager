// frontend/js/tasks.js

// [My Code] - Define API base URL for backend communication
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Make sure this matches your Django backend URL

// [My Code] - Get references to HTML elements for task lists and forms
// Replaced single tasksListDiv with two separate divs for better organization
const notDoneTasksListDiv = document.getElementById('not-done-tasks-list'); 
const doneTasksListDiv = document.getElementById('done-tasks-list');     
const createTaskForm = document.getElementById('create-task-form');
const logoutButton = document.getElementById('logout-button');

// --- Utility Functions ---

// [Gemini Code] - Function to retrieve the authentication token from browser's local storage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// [Gemini Code] - Function to check user authentication status and redirect to login if no token is found
function checkAuthAndRedirect() {
    if (!getAuthToken()) {
        window.location.href = 'index.html'; // Redirect to login/signup if no token
    }
}

// [Gemini Code] - Function to format date strings for display in a user-friendly format
function formatDate(dateString) {
    if (!dateString) return '';
    // This will format date according to the user's browser locale (e.g., en-US for English)
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options); 
}

// [My Code with Gemini's Help] - Function to map task status values to Bootstrap color classes and display text
function getStatusDisplay(status) {
    let colorClass = '';
    let text = '';
    switch (status) {
        case 'todo':
            colorClass = 'status-todo';
            text = 'TODO'; 
            break;
        case 'in_progress':
            colorClass = 'status-in_progress';
            text = 'In Progress'; 
            break;
        case 'done':
            colorClass = 'status-done';
            text = 'DONE'; 
            break;
        default:
            colorClass = '';
            text = status;
    }
    return { colorClass, text };
}

// --- Task Rendering ---

// [Gemini Code] - Function to dynamically create and return an HTML card for a single task
function createTaskCard(task) {
    const { colorClass, text: statusText } = getStatusDisplay(task.status);
    const cardCol = document.createElement('div');
    cardCol.className = 'col-md-6 col-lg-4'; // Bootstrap grid classes for layout

    cardCol.innerHTML = `
        <div class="card task-card ${colorClass}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">
                    Status: ${statusText} | Priority: ${task.priority === 'now' ? 'NOW' : 'THEN'}
                </h6>
                ${task.due_date ? `<p class="card-text">Due Date: ${formatDate(task.due_date)}</p>` : ''}
                ${task.comment ? `<p class="card-text small">Description: ${task.comment}</p>` : ''}
                <p class="card-text"><small class="text-muted">Created at: ${formatDate(task.created_at)}</small></p>
                ${task.done_at ? `<p class="card-text"><small class="text-muted">Done at: ${formatDate(task.done_at)}</small></p>` : ''}
                <div class="mt-3">
                    ${task.status !== 'done' ? `<button class="btn btn-sm btn-success me-2 mark-done-btn" data-id="${task.id}">DONE</button>` : ''}
                    <button class="btn btn-sm btn-info me-2 edit-task-btn" data-id="${task.id}" data-bs-toggle="modal" data-bs-target="#editTaskModal">EDIT</button>
                    <button class="btn btn-sm btn-danger delete-task-btn" data-id="${task.id}">REMOVE</button>
                </div>
            </div>
        </div>
    `;

    // [My Code with Gemini's Help] - Attach event listeners to buttons within the task card for interactivity
    const markDoneBtn = cardCol.querySelector('.mark-done-btn');
    if (markDoneBtn) {
        markDoneBtn.addEventListener('click', () => markTaskAsDone(task.id));
    }
    cardCol.querySelector('.edit-task-btn').addEventListener('click', () => populateEditModal(task));
    cardCol.querySelector('.delete-task-btn').addEventListener('click', () => deleteTask(task.id));

    return cardCol;
}

// [My Code with Gemini's Help] - Function to fetch all tasks from the API and display them in their respective sections
async function fetchAndDisplayTasks() {
    checkAuthAndRedirect(); // Ensure user is logged in before fetching tasks

    // Clear existing lists and show loading messages
    notDoneTasksListDiv.innerHTML = '<p class="text-center text-muted">Loading To Do & In Progress tasks...</p>';
    doneTasksListDiv.innerHTML = '<p class="text-center text-muted">Loading DONE tasks...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${getAuthToken()}`, // Send token for authentication
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const tasks = await response.json();
            
            // Clear loading messages after data is successfully fetched
            notDoneTasksListDiv.innerHTML = ''; 
            doneTasksListDiv.innerHTML = '';

            let hasNotDoneTasks = false;
            let hasDoneTasks = false;

            // Iterate through tasks and append them to the correct display list based on their status
            tasks.forEach(task => {
                if (task.status === 'done') {
                    doneTasksListDiv.appendChild(createTaskCard(task));
                    hasDoneTasks = true;
                } else {
                    notDoneTasksListDiv.appendChild(createTaskCard(task));
                    hasNotDoneTasks = true;
                }
            });

            // Display "No tasks" message if a section remains empty after loading
            if (!hasNotDoneTasks) {
                notDoneTasksListDiv.innerHTML = '<p class="text-center text-muted">No To Do or In Progress tasks.</p>';
            }
            if (!hasDoneTasks) {
                doneTasksListDiv.innerHTML = '<p class="text-center text-muted">No DONE tasks.</p>';
            }

        } else if (response.status === 401) {
            // Unauthorized, token might be invalid or expired. Redirect to login.
            alert('Your session has expired. Please log in again.'); 
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        } else {
            // Handle other HTTP errors when fetching tasks
            const errorData = await response.json();
            console.error('Failed to fetch tasks:', errorData);
            notDoneTasksListDiv.innerHTML = '<p class="text-center text-danger">Error loading tasks.</p>';
            doneTasksListDiv.innerHTML = ''; // Clear loading for done tasks too
        }
    } catch (error) {
        // Handle network errors during task fetching
        console.error('Network error fetching tasks:', error);
        notDoneTasksListDiv.innerHTML = '<p class="text-center text-danger">Error connecting to server.</p>';
        doneTasksListDiv.innerHTML = ''; // Clear loading for done tasks too
    }
}

// --- Task Actions (Create, Update, Delete) ---

// [Gemini Code] - Handle the submission of the "Create Task" form
createTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Get values from the form fields
    const title = document.getElementById('task-title').value;
    const status = document.getElementById('task-status').value;
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-due-date').value; // Format: YYYY-MM-DD
    const comment = document.getElementById('task-comment').value;

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${getAuthToken()}`, // Send authentication token
            },
            body: JSON.stringify({
                title,
                status,
                priority,
                due_date: dueDate || null, // Send null if due date is empty
                comment,
            }),
        });

        if (response.ok) { // Check for successful HTTP status (200-299)
            document.getElementById('create-task-form').reset(); // Clear the form fields
            fetchAndDisplayTasks(); // Refresh the task lists to show the new task
        } else {
            // Parse and display error messages from the API response
            const errorData = await response.json();
            alert('Error adding task: ' + Object.values(errorData).flat().join(', '));
        }
    } catch (error) {
        // Handle network or other unexpected errors during task creation
        console.error('Error creating task:', error);
        alert('Error connecting to server to add task.');
    }
});

// [My Code with Gemini's Help] - Handle marking a task as "DONE"
async function markTaskAsDone(taskId) {
    if (!confirm('Are you sure you want to mark this task as DONE?')) {
        return; // User cancelled the action
    }

    try {
        // First, fetch the current task details to get all fields required for a PUT request
        const currentTaskResponse = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${getAuthToken()}`,
            },
        });

        if (!currentTaskResponse.ok) {
            const errorData = await currentTaskResponse.json();
            alert('Error fetching task details for update: ' + (errorData.detail || ''));
            return;
        }

        const currentTask = await currentTaskResponse.json();

        // Prepare the updated data: all existing fields + the new 'done' status
        const updatedData = {
            title: currentTask.title,
            status: 'done', // This is the only field we are explicitly changing
            priority: currentTask.priority,
            due_date: currentTask.due_date,
            comment: currentTask.comment,
        };

        // Send the complete updated object to the API using PUT method
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
            method: 'PUT', // Use PUT to update the whole object
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${getAuthToken()}`,
            },
            body: JSON.stringify(updatedData), 
        });

        if (response.ok) {
            fetchAndDisplayTasks(); // Refresh the task lists after successful update
        } else {
            // Parse and display error messages from the API response
            const errorData = await response.json();
            alert('Error updating task status: ' + Object.values(errorData).flat().join(', '));
        }
    } catch (error) {
        // Handle network or other unexpected errors
        console.error('Error marking task as done:', error);
        alert('Error connecting to server to update task.');
    }
}

// [Gemini Code] - Handle deleting a task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return; // User cancelled the action
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${getAuthToken()}`, // Send authentication token
            },
        });

        if (response.status === 204) { // 204 No Content is the expected status for successful deletion
            fetchAndDisplayTasks(); // Refresh the task lists after successful deletion
        } else {
            // Handle errors for deletion. Response might not have a body for 404.
            const errorData = await response.json(); 
            alert('Error deleting task: ' + (errorData.detail || ''));
        }
    } catch (error) {
        // Handle network or other unexpected errors
        console.error('Error deleting task:', error);
        alert('Error connecting to server to delete task.');
    }
}

// --- Logout Functionality ---
// [Gemini Code] - Handle the logout button click
logoutButton.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default link behavior
    try {
        const response = await fetch(`${API_BASE_URL}/logout/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${getAuthToken()}`, // Send authentication token
                'Content-Type': 'application/json' // Django's logout endpoint expects JSON
            },
        });

        if (response.ok) { // Check for successful HTTP status (200-299)
            localStorage.removeItem('authToken'); // Remove the authentication token from local storage
            alert('Successfully logged out.'); // Inform the user
            window.location.href = 'index.html'; // Redirect to the login page
        } else {
            // Handle errors during logout
            alert('Error logging out. Please try again.');
        }
    } catch (error) {
        // Handle network or other unexpected errors
        console.error('Error during logout:', error);
        alert('Error connecting to server for logout.');
    }
});

// --- Edit Task Modal Logic ---
// [My Code with Gemini's Help] - Function to populate the edit task modal with existing task data
function populateEditModal(task) {
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-status').value = task.status;
    document.getElementById('edit-task-priority').value = task.priority;
    // Set due date, ensuring it's an empty string if null to prevent 'Invalid Date' in input
    document.getElementById('edit-task-due-date').value = task.due_date || ''; 
    document.getElementById('edit-task-comment').value = task.comment || ''; 
}

// [My Code with Gemini's Help] - Handle the submission of the "Edit Task" form within the modal
document.getElementById('edit-task-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get the task ID and updated values from the modal form fields
    const taskId = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value;
    const status = document.getElementById('edit-task-status').value;
    const priority = document.getElementById('edit-task-priority').value;
    const dueDate = document.getElementById('edit-task-due-date').value;
    const comment = document.getElementById('edit-task-comment').value;

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
            method: 'PUT', // Use PUT to update the entire task object
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${getAuthToken()}`, // Send authentication token
            },
            body: JSON.stringify({
                title,
                status,
                priority,
                due_date: dueDate || null, // Send null if empty
                comment,
            }),
        });

        if (response.ok) { // Check for successful HTTP status (200-299)
            // Hide the modal after successful update
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            if (editModal) {
                editModal.hide();
            } else {
                // Fallback for hiding modal if Bootstrap JS instance is not found
                const modalElement = document.getElementById('editTaskModal');
                if (modalElement) modalElement.classList.remove('show');
                if (modalElement) modalElement.style.display = 'none';
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            }
            fetchAndDisplayTasks(); // Refresh the task lists to show updated task
        } else {
            // Parse and display error messages from the API response
            const errorData = await response.json();
            alert('Error updating task: ' + Object.values(errorData).flat().join(', '));
        }
    } catch (error) {
        // Handle network or other unexpected errors
        console.error('Error updating task:', error);
        alert('Error connecting to server to update task.');
    }
});


// --- Initial Load ---

// [Gemini Code] - On page load, perform initial authentication check and fetch tasks
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndRedirect();
    fetchAndDisplayTasks();
});
