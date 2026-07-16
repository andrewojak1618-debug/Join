const taskStorageKey = "joinTasks";


/**
 * Reads the locally saved task list for the temporary localStorage step.
 */
function getStoredTasks() {
  const storedTasks = localStorage.getItem(taskStorageKey);
  return storedTasks ? JSON.parse(storedTasks) : [];
}


/**
 * Saves the complete task list in localStorage.
 */
function saveStoredTasks(tasks) {
  localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
}


/**
 * Adds one new task to the locally saved task list.
 */
function saveCreatedTask(task) {
  const tasks = getStoredTasks();
  tasks.push(task);
  saveStoredTasks(tasks);
}


/**
 * Replaces one existing task after it was edited on the board.
 */
function updateStoredTask(updatedTask) {
  const tasks = getStoredTasks();
  const updatedTasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));
  saveStoredTasks(updatedTasks);
}


/**
 * Removes one task from the locally saved task list.
 */
function deleteStoredTask(taskId) {
  const tasks = getStoredTasks();
  const remainingTasks = tasks.filter((task) => task.id !== taskId);
  saveStoredTasks(remainingTasks);
}


/**
 * Converts supported task date values into the stored ISO date format.
 */
function normalizeTaskDueDate(value) {
  const dateParts = getTaskDueDateParts(value);
  if (!dateParts || !isMatchingTaskDateParts(dateParts)) return "";
  const month = String(dateParts.month).padStart(2, "0");
  const day = String(dateParts.day).padStart(2, "0");
  return `${dateParts.year}-${month}-${day}`;
}


/**
 * Formats a supported task date for the Join user interface.
 */
function formatTaskDueDate(value) {
  const normalizedDate = normalizeTaskDueDate(value);
  if (!normalizedDate) return "";
  const [year, month, day] = normalizedDate.split("-");
  return `${day}/${month}/${year}`;
}


/**
 * Parses a supported task date without shifting it through UTC.
 */
function parseTaskDueDate(value) {
  const dateParts = getTaskDueDateParts(value);
  if (!dateParts || !isMatchingTaskDateParts(dateParts)) return null;
  return new Date(dateParts.year, dateParts.month - 1, dateParts.day);
}


/**
 * Reads ISO and legacy Join date strings into numeric date parts.
 */
function getTaskDueDateParts(value) {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (isoMatch) return getDatePartsFromMatch(isoMatch, 1, 2, 3);
  const joinMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || "");
  return joinMatch ? getDatePartsFromMatch(joinMatch, 3, 2, 1) : null;
}


/**
 * Maps matched date groups to a common date-parts object.
 */
function getDatePartsFromMatch(match, yearIndex, monthIndex, dayIndex) {
  return {
    year: Number(match[yearIndex]),
    month: Number(match[monthIndex]),
    day: Number(match[dayIndex]),
  };
}


/**
 * Rejects dates that JavaScript silently rolls into another month.
 */
function isMatchingTaskDateParts(dateParts) {
  const date = new Date(dateParts.year, dateParts.month - 1, dateParts.day);
  return date.getFullYear() === dateParts.year
    && date.getMonth() === dateParts.month - 1
    && date.getDate() === dateParts.day;
}
