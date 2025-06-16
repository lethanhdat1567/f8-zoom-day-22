const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const form = $('.todo-app-form');
const modal = $('#addTaskModal');
const firstInput = $('.form-input');
const tasksBody = $('.task-grid');
const addBtn = $('.add-btn');
const closeBtn = $('.modal-close');
const cancelBtn = $('#cancelBtn');
const tabs = $('.tabs');
const searchInput = $('.search-input');
const clearSearchBtn = $('.close-search-icon');

const tabBtns = tabs.querySelectorAll('.tab-button');
const titleFormGroup = firstInput.closest('.form-group');
const warning = $('.warning');

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
        isCompleted: false,
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
        isCompleted: true,
    },
];

// Open/Close modal
function openModal() {
    modal.classList.add('show');

    setTimeout(() => {
        firstInput.focus();
    }, 100);
}

function closeModal() {
    const modalTitle = modal.querySelector('.modal-title');
    const editBtn = modal.querySelector('.btn-submit');

    backToOriginalText(modalTitle);
    backToOriginalText(editBtn);

    titleFormGroup.classList.remove('error');
    modal.classList.remove('show');

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
cancelBtn.onclick = closeModal;

// Handle utils
tasksBody.onclick = function (event) {
    const editBtn = event.target.closest('.edit-btn');
    const deleteBtn = event.target.closest('.delete-btn');
    const completeBtn = event.target.closest('.complete-btn');

    const taskItem = event.target.closest('.task-card');
    const taskIndex = taskItem && taskItem.dataset.index;

    if (editBtn) {
        const task = todoTask[taskIndex];

        for (const key in task) {
            if (key !== 'isCompleted') {
                const input = $(`[name="${key}"]`);
                input.value = task[key];
            }
        }
        openModal();

        const modalTitle = modal.querySelector('.modal-title');
        const submitBtn = modal.querySelector('.btn-submit');

        changeElementText(modalTitle, 'Edit Task');
        changeElementText(submitBtn, 'Save');

        editIndex = taskIndex;
    }

    if (deleteBtn) {
        const confirmBtn = warning.querySelector('.btn-confirm');
        const cancelBtn = warning.querySelector('.btn-cancel');

        warning.classList.add('active');

        confirmBtn.onclick = function () {
            todoTask.splice(taskIndex, 1);
            updateTodo();
            warning.classList.remove('active');
            toast({
                title: `Success`,
                message: `you are delete successfully.`,
                type: 'success',
                duration: 600,
            });
        };

        cancelBtn.onclick = function () {
            warning.classList.remove('active');
        };
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
    formData.isCompleted = false;

    // Check duplicate
    const newTitle = formData.title;
    const isDuplicate = todoTask.find((todo, index) => {
        if (editIndex && Number(editIndex) === index) return false;

        return todo.title === newTitle;
    });

    if (isDuplicate) {
        titleFormGroup.classList.add('error');
    } else {
        if (editIndex) {
            todoTask[editIndex] = formData;
        } else {
            formData.isCompleted = false;
            todoTask.unshift(formData);
        }

        titleFormGroup.classList.remove('error');
        closeModal();
        updateTodo();
        toast({
            title: `Success`,
            message: `You are ${editIndex ? 'update' : 'create'} successfully!.`,
            type: 'success',
            duration: 600,
        });
    }
};

// Tabs
const TabsStatus = {
    all() {
        renderTasks();
    },
    active() {
        const newTodoList = todoTask.filter((todo) => todo.isCompleted === false);
        renderTasks(newTodoList);
    },
    completed() {
        const newTodoList = todoTask.filter((todo) => todo.isCompleted === true);
        renderTasks(newTodoList);
    },
};

tabs.onclick = function (event) {
    const isSearching = !!searchInput.value;

    if (!isSearching) {
        const activeTabBtn = event.target.closest('.tab-button');
        if (activeTabBtn) {
            tabBtns.forEach((tab) => tab.classList.remove('active'));

            activeTabBtn.classList.add('active');

            const status = activeTabBtn.dataset.status;

            TabsStatus[status]();
        }
    }
};

//Search
searchInput.oninput = function (event) {
    // Back to all tab status
    tabBtns.forEach((tab) => tab.classList.remove('active'));
    tabBtns[0].classList.add('active');

    let inputValue = event.target.value;

    if (inputValue.trim()) {
        clearSearchBtn.classList.add('active');

        const newTodoList = todoTask.filter((todo) => {
            const todoTitle = todo.title.trim().toLowerCase();
            const todoDesc = todo.description.trim().toLowerCase();
            const formatInput = inputValue.trim().toLowerCase();

            return todoTitle.includes(formatInput) || todoDesc.includes(formatInput);
        });

        if (newTodoList.length > 0) {
            renderTasks(newTodoList);
        } else {
            tasksBody.classList.add('empty');
            tasksBody.innerHTML = `
            <div class="empty-search">
                 <img
                     class="empty-search_img"
                         src="./images/search-no-result-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector-removebg-preview.png"
                    />
                     <p class="empty-search_description">Task not found :<</p>
            </div>
            `;
        }

        clearSearchBtn.onclick = function () {
            event.target.value = '';
            clearSearch();
        };
    } else {
        clearSearch();
    }
};

// Render UI
function renderTasks(tasks = todoTask) {
    tasksBody.innerHTML = '';

    const result = tasks
        .map(
            (todo, index) => `<div class="task-card ${escapeHTML(todo.cardColor)} ${
                todo.isCompleted ? 'completed' : ''
            }" data-index="${index}">
          <div class="task-header">
            <h3 class="task-title">${escapeHTML(todo.title)}</h3>
            <button class="task-menu">
              <i class="fa-solid fa-ellipsis fa-icon"></i>
              <div class="dropdown-menu">
                <div class="dropdown-item edit-btn">
                  <i class="fa-solid fa-pen-to-square fa-icon"></i>
                  Edit
                </div>
                <div class="dropdown-item complete complete-btn">
                  <i class="fa-solid fa-check fa-icon"></i>
                 ${escapeHTML(todo.isCompleted) ? 'Mark as InActive' : 'Mark as Active'}
                </div>
                <div class="dropdown-item delete delete-btn">
                  <i class="fa-solid fa-trash fa-icon"></i>
                  Delete
                </div>
              </div>
            </button>
          </div>
          <p class="task-description">
            ${escapeHTML(todo.description)}
          </p>
          <div class="task-time-wrap">
            <div class="task-time">${padTime(escapeHTML(todo.startTime))} - ${padTime(escapeHTML(todo.endTime))}</div>
            <div class="task-due-time">Due to: ${escapeHTML(todo.dueDate) ? escapeHTML(todo.dueDate) : 'Empty'}</div>
          </div>
        </div>`
        )
        .join('');

    tasksBody.innerHTML = result;
}
renderTasks();

// Utils
function padTime(time) {
    const hour = time.split(':')[0];
    if (time) {
        if (hour < 12) {
            return time.padEnd(8, ' AM');
        } else {
            return time.padEnd(8, ' PM');
        }
    } else {
        return 'Empty';
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

function clearSearch() {
    clearSearchBtn.classList.remove('active');
    tasksBody.classList.remove('empty');
    renderTasks();
}

function toast({ title = '', message = '', type = 'info', duration = 3000 }) {
    const main = document.getElementById('toast');
    if (main) {
        const toast = document.createElement('div');

        // Auto remove toast
        const autoRemoveId = setTimeout(function () {
            main.removeChild(toast);
        }, duration + 1000);

        // Remove toast when clicked
        toast.onclick = function (e) {
            if (e.target.closest('.toast__close')) {
                main.removeChild(toast);
                clearTimeout(autoRemoveId);
            }
        };

        const icons = {
            success: 'fas fa-check-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-circle',
            error: 'fas fa-exclamation-circle',
        };
        const icon = icons[type];
        const delay = (duration / 1000).toFixed(2);

        toast.classList.add('toast', `toast--${type}`);
        toast.style.animation = `slideInUp ease .3s, fadeOut linear 1s ${delay}s forwards`;

        toast.innerHTML = `
                    <div class="toast__icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="toast__body">
                        <h3 class="toast__title">${title}</h3>
                        <p class="toast__msg">${message}</p>
                    </div>
                    <div class="toast__close">
                        <i class="fas fa-times"></i>
                    </div>
                `;
        main.appendChild(toast);
    }
}

function escapeHTML(html) {
    const tempElement = document.createElement('div');
    tempElement.textContent = html;

    return tempElement.innerHTML;
}
