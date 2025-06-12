const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const form = $('.todo-app-form');
const modal = $('#addTaskModal');
const firstInput = $('.form-input');
const tasksBody = $('.task-grid');
const addBtn = $('.add-btn');
const closeBtn = $('.modal-close');
const cancelBtn = $('#cancelBtn');

let editIndex = null;

const todoTask = JSON.parse(localStorage.getItem('todo')) || [
    {
        title: 'Client meeting',
        description: 'Discuss requirements with client',
        category: 'meeting',
        priority: 'medium',
        startTime: '13:00',
        endTime: '14:30',
        dueDate: '2025-06-13',
        cardColor: 'blue',
    },
    {
        title: 'Design homepage',
        description: 'Create responsive layout for homepage',
        category: 'design',
        priority: 'high',
        startTime: '09:00',
        endTime: '11:00',
        dueDate: '2025-06-12',
        cardColor: 'purple',
    },
];

// Open/Close modal
function openModal() {
    modal.className = 'modal-overlay show';

    setTimeout(() => {
        firstInput.focus();
    }, 100);
}

function closeModal() {
    const modalTitle = modal.querySelector('.modal-title');
    const editBtn = modal.querySelector('.btn-submit');
    backToOriginalText(modalTitle);
    backToOriginalText(editBtn);

    modal.className = 'modal-overlay';

    // Scroll top
    const formAdd = modal.querySelector('.modal');
    setTimeout(() => {
        formAdd.scrollTop = 0;
    }, 300);

    form.reset();
    editIndex = null;
}

addBtn.onclick = openModal;
closeBtn.onclick = closeModal;
cancelBtn.onclick = function () {
    closeModal();
};

// Handle utils
tasksBody.onclick = function (event) {
    const editBtn = event.target.closest('.edit-btn');
    const deleteBtn = event.target.closest('.delete-btn');
    const completeBtn = event.target.closest('.complete-btn');

    const taskItem = event.target.closest('.task-card');
    const taskIndex = taskItem && taskItem.dataset.index;

    if (editBtn) {
        const task = todoTask[taskIndex];

        // Fill input value
        for (const key in task) {
            if (key !== 'isCompleted') {
                const input = $(`[name="${key}"]`);
                input.value = task[key];
            }
        }
        openModal();

        // Change UI when update
        const modalTitle = modal.querySelector('.modal-title');
        const submitBtn = modal.querySelector('.btn-submit');

        changeElementText(modalTitle, 'Edit Task');
        changeElementText(submitBtn, 'Save');

        editIndex = taskIndex;
    }

    if (deleteBtn) {
        if (confirm('Bạn có chắc chắn muốn xóa')) {
            todoTask.splice(taskIndex, 1);
            updateTodo();
        }
    }

    if (completeBtn) {
        const task = todoTask[taskIndex];

        task.isCompleted = !task.isCompleted;
        updateTodo();
    }
};

// Submit form
form.onsubmit = function (event) {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(form));

    if (editIndex) {
        todoTask[editIndex] = formData;
    } else {
        formData.isCompleted = false;
        todoTask.unshift(formData);
    }

    form.reset();
    closeModal();
    updateTodo();
};

// Render UI
function renderTasks() {
    tasksBody.innerHTML = '';

    const result = todoTask
        .map(
            (todo, index) => `<div class="task-card ${todo.cardColor} ${todo.isCompleted ? 'completed' : ''}" data-index="${index}">
          <div class="task-header">
            <h3 class="task-title">${todo.title}</h3>
            <button class="task-menu">
              <i class="fa-solid fa-ellipsis fa-icon"></i>
              <div class="dropdown-menu">
                <div class="dropdown-item edit-btn">
                  <i class="fa-solid fa-pen-to-square fa-icon"></i>
                  Edit
                </div>
                <div class="dropdown-item complete complete-btn">
                  <i class="fa-solid fa-check fa-icon"></i>
                 ${todo.isCompleted ? 'Mark as InActive' : 'Mark as Active'}
                </div>
                <div class="dropdown-item delete delete-btn">
                  <i class="fa-solid fa-trash fa-icon"></i>
                  Delete
                </div>
              </div>
            </button>
          </div>
          <p class="task-description">
            ${todo.description}
          </p>
          <div class="task-time">${padTime(todo.startTime)} - ${padTime(todo.endTime)}</div>
        </div>`
        )
        .join('');

    tasksBody.innerHTML = result;
}
renderTasks();

// utils
function padTime(time) {
    const hour = time.split(':')[0];

    if (hour < 12) {
        return time.padEnd(8, ' AM');
    } else {
        return time.padEnd(8, ' PM');
    }
}

function changeElementText(element, content) {
    if (element) {
        element.dataset.original = element.textContent;
        element.innerText = content;
    }
}

function backToOriginalText(element) {
    element.innerText = element.dataset.original || element.innerText;
    delete element.dataset.original;
}

function updateTodo() {
    renderTasks();
    localStorage.setItem('todo', JSON.stringify(todoTask));
}
