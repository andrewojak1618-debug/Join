/**
 * Loads tasks from Firestore when available, otherwise from localStorage.
 */
async function loadTasksFromStore() {
  if (isTaskFirestoreReady()) return window.joinFirebaseTasks.loadTasks();
  return getStoredTasks();
}

/**
 * Creates one task in Firestore or localStorage and returns it with an id.
 */
async function createTaskInStore(task) {
  if (isTaskFirestoreReady()) return window.joinFirebaseTasks.createTask(task);
  saveCreatedTask(task);
  return task;
}

/**
 * Updates one task in Firestore or localStorage.
 */
async function updateTaskInStore(task) {
  if (isTaskFirestoreReady()) {
    await window.joinFirebaseTasks.updateTask(task.id, task);
    return;
  }
  updateStoredTask(task);
}

/**
 * Deletes one task from Firestore or localStorage.
 */
async function deleteTaskFromStore(taskId) {
  if (isTaskFirestoreReady()) {
    await window.joinFirebaseTasks.deleteTask(taskId);
    return;
  }
  deleteStoredTask(taskId);
}

function isTaskFirestoreReady() {
  return Boolean(window.joinFirebaseTasks);
}
