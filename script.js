let taskInput = document.getElementById("taskInput");
let category = document.getElementById("category");
let deadline = document.getElementById("deadline");
let addBtn = document.getElementById("addBtn");
let taskList = document.getElementById("taskList");

let totalTasks = document.getElementById("totalTasks");
let completedTasks = document.getElementById("completedTasks");
let pendingTasks = document.getElementById("pendingTasks");

let exportBtn = document.getElementById("exportBtn");
let importFile = document.getElementById("importFile");
let darkToggle = document.getElementById("darkModeToggle");

// --- LOAD TASKS ---
window.onload = loadTasks;
addBtn.addEventListener("click", addTask);

// ADD TASK
function addTask() {
  if (taskInput.value.trim() === "") return alert("Enter a task!");

  let task = {
    id: Date.now(),
    text: taskInput.value,
    category: category.value,
    deadline: deadline.value,
    completed: false,
  };

  addTaskToUI(task);
  saveToStorage(task);
  updateAnalytics();

  taskInput.value = "";
  deadline.value = "";
}

// DISPLAY TASK
function addTaskToUI(task) {
  let li = document.createElement("li");
  li.draggable = true;
  li.dataset.id = task.id;

  let isNearDeadline = checkDeadline(task.deadline);
  if (isNearDeadline) li.classList.add("deadline-near");

  li.innerHTML = `
        <div>
            <strong>${task.text}</strong><br>
            <small>${task.category}</small>
            ${task.deadline ? `<br><small>⏳ ${task.deadline}</small>` : ""}
        </div>

        <div>
            <button class="complete" onclick="toggleComplete(${
              task.id
            })">✔</button>
            <button class="edit" onclick="editTask(${task.id})">✏</button>
            <button class="delete" onclick="deleteTask(${task.id})">🗑</button>
        </div>
    `;

  li.addEventListener("dragstart", dragStart);
  li.addEventListener("dragover", dragOver);
  li.addEventListener("drop", dropTask);

  if (task.completed) li.style.textDecoration = "line-through";

  taskList.appendChild(li);
}

// SAVE TO STORAGE
function saveToStorage(task) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// LOAD TASKS
function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((t) => addTaskToUI(t));
  updateAnalytics();
}

// EDIT TASK
function editTask(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  let task = tasks.find((t) => t.id === id);

  let newText = prompt("Edit task:", task.text);
  if (!newText) return;

  task.text = newText;

  localStorage.setItem("tasks", JSON.stringify(tasks));
  reloadUI();
}

// DELETE TASK
function deleteTask(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  tasks = tasks.filter((t) => t.id !== id);

  localStorage.setItem("tasks", JSON.stringify(tasks));
  reloadUI();
}

// COMPLETE TASK
function toggleComplete(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  let task = tasks.find((t) => t.id === id);

  task.completed = !task.completed;

  localStorage.setItem("tasks", JSON.stringify(tasks));
  reloadUI();
}

// --- DEADLINE WARNING ---
function checkDeadline(date) {
  if (!date) return false;

  let today = new Date();
  let taskDate = new Date(date);

  let diff = (taskDate - today) / (1000 * 60 * 60 * 24);

  return diff <= 1; // deadline close
}

// RELOAD UI
function reloadUI() {
  taskList.innerHTML = "";
  loadTasks();
}

// --- ANALYTICS ---
function updateAnalytics() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  totalTasks.innerText = tasks.length;
  completedTasks.innerText = tasks.filter((t) => t.completed).length;
  pendingTasks.innerText = tasks.filter((t) => !t.completed).length;
}

// --- DRAG & DROP ---
let draggedItem = null;

function dragStart(e) {
  draggedItem = this;
}

function dragOver(e) {
  e.preventDefault();
}

function dropTask() {
  taskList.insertBefore(draggedItem, this);
}

// --- DARK MODE ---
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// --- EXPORT ---
exportBtn.addEventListener("click", () => {
  let tasks = localStorage.getItem("tasks");
  let blob = new Blob([tasks], { type: "application/json" });

  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tasks.json";
  a.click();
});

// --- IMPORT ---
importFile.addEventListener("change", function () {
  let reader = new FileReader();
  reader.onload = function () {
    localStorage.setItem("tasks", reader.result);
    reloadUI();
  };
  reader.readAsText(this.files[0]);
});
