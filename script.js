const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const form = $(".todo-app-form");
const modal = $("#addTaskModal");
const firstInput = $(".form-input");
const addBtn = $(".add-btn");
const closeBtn = $(".modal-close");
const cancelBtn = $("#cancelBtn");

// Form input
const titleInput = $("#taskTitle");
const descriptionInput = $("#taskDescription");
const categoryInput = $("#taskCategory");
const priorityInput = $("#taskPriority");
const startTimeInput = $("#startTime");
const endTimeInput = $("#endTime");
const dueDateInput = $("#taskDate");
const cardColorInput = $("#taskColor");
const tasksBody = $(".task-grid");

const todoTask = [
  {
    title: "Client meeting",
    description: "Discuss requirements with client",
    category: "meeting",
    priority: "medium",
    startTime: "13:00",
    endTime: "14:30",
    DueDate: "2025-06-13",
    cardColor: "blue",
    isCompleted: true,
  },
  {
    title: "Design homepage",
    description: "Create responsive layout for homepage",
    category: "design",
    priority: "high",
    startTime: "09:00",
    endTime: "11:00",
    DueDate: "2025-06-12",
    cardColor: "purple",
    isCompleted: false,
  },
];
renderTasks();

// Open/Close modal
function openModal() {
  modal.className = "modal-overlay show";

  setTimeout(() => {
    firstInput.focus();
  }, 100);
}

function closeModal() {
  modal.className = "modal-overlay";
}

addBtn.onclick = openModal;
closeBtn.onclick = closeModal;
cancelBtn.onclick = function () {
  closeModal();
};

// Submit form
form.onsubmit = function (event) {
  event.preventDefault();

  const newTask = {
    title: titleInput.value,
    description: descriptionInput.value,
    category: categoryInput.value,
    priority: priorityInput.value,
    startTime: startTimeInput.value,
    endTime: endTimeInput.value,
    DueDate: dueDateInput.value,
    cardColor: cardColorInput.value,
    isCompleted: false,
  };

  todoTask.unshift(newTask);
  form.reset();
  closeModal();
  renderTasks();
};

// Render
function renderTasks() {
  tasksBody.innerHTML = "";

  const result = todoTask
    .map(
      (todo) => `<div class="task-card ${todo.cardColor} ${
        todo.isCompleted ? "completed" : ""
      }">
          <div class="task-header">
            <h3 class="task-title">${todo.title}</h3>
            <button class="task-menu">
              <i class="fa-solid fa-ellipsis fa-icon"></i>
              <div class="dropdown-menu">
                <div class="dropdown-item">
                  <i class="fa-solid fa-pen-to-square fa-icon"></i>
                  Edit
                </div>
                <div class="dropdown-item complete">
                  <i class="fa-solid fa-check fa-icon"></i>
                  Mark as Active
                </div>
                <div class="dropdown-item delete">
                  <i class="fa-solid fa-trash fa-icon"></i>
                  Delete
                </div>
              </div>
            </button>
          </div>
          <p class="task-description">
            ${todo.description}
          </p>
          <div class="task-time">${padTime(todo.startTime)} - ${padTime(
        todo.endTime
      )}</div>
        </div>`
    )
    .join("");

  tasksBody.innerHTML = result;
}

function padTime(time) {
  const hour = time.split(":")[0];

  if (hour < 12) {
    return time.padEnd(8, " AM");
  } else {
    return time.padEnd(8, " PM");
  }
}
