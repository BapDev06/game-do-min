// Lấy các phần tử HTML cần dùng
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");

// Hàm tạo một task mới trong danh sách
function createTaskItem(taskText) {
  const li = document.createElement("li");
  li.className = "task-item";

  const span = document.createElement("span");
  span.textContent = taskText;

  const buttons = document.createElement("div");

  const completeBtn = document.createElement("button");
  completeBtn.textContent = "✔";
  completeBtn.style.marginRight = "8px";
  completeBtn.addEventListener("click", () => {
    li.classList.toggle("completed");
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑";
  deleteBtn.addEventListener("click", () => {
    li.remove();
  });

  buttons.appendChild(completeBtn);
  buttons.appendChild(deleteBtn);

  li.appendChild(span);
  li.appendChild(buttons);

  taskList.appendChild(li);
}

// Sự kiện khi click nút "Thêm"
addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  if (taskText !== "") {
    createTaskItem(taskText);
    taskInput.value = "";
    taskInput.focus();
  }
});

const toggleModeBtn = document.getElementById("toggle-mode");

// Kiểm tra trạng thái dark mode đã lưu
if (localStorage.getItem("mode") === "dark") {
  document.body.classList.add("dark");
  toggleModeBtn.textContent = "☀️ Light Mode";
}

// Xử lý khi nhấn nút
toggleModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");

  // Cập nhật text của nút
  toggleModeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

  // Lưu trạng thái vào localStorage
  localStorage.setItem("mode", isDark ? "dark" : "light");
});
