const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createMemoryStorage,
  loadBrowserScripts,
  toPlainValue,
} = require("./helpers/scriptContext");

const TASKS_SCRIPT = "components/js/tasks.js";
const TASK_STORE_SCRIPT = "components/js/tasks-store.js";
const TASK_STORAGE_KEY = "joinTasks";

/**
 * Loads the local task logic with optional tasks in memory.
 * @param {Object[]} [initialTasks] - Tasks available at test start.
 * @returns {Object} Test context and its memory storage.
 */
function createTaskContext(initialTasks) {
  const initialEntries = initialTasks
    ? { [TASK_STORAGE_KEY]: JSON.stringify(initialTasks) }
    : {};
  const localStorage = createMemoryStorage(initialEntries);
  const context = loadBrowserScripts([TASKS_SCRIPT], { localStorage });
  return { context, localStorage };
}


/**
 * Loads the task store with a mocked Firebase adapter.
 * @param {Object} firebaseTasks - Mocked Firebase task methods.
 * @returns {Object} Test context and its memory storage.
 */
function createFirebaseTaskContext(firebaseTasks) {
  const localStorage = createMemoryStorage();
  const window = { joinFirebaseTasks: firebaseTasks };
  const context = loadBrowserScripts(
    [TASKS_SCRIPT, TASK_STORE_SCRIPT], { localStorage, window }
  );
  return { context, localStorage };
}


test("returns an empty task list when localStorage has no tasks", () => {
  const { context } = createTaskContext();
  assert.deepEqual(toPlainValue(context.getStoredTasks()), []);
});


test("adds a new task to localStorage", () => {
  const existingTask = { id: "task-1", title: "Existing task" };
  const newTask = { id: "task-2", title: "Write tests" };
  const { context } = createTaskContext([existingTask]);
  context.saveCreatedTask(newTask);
  assert.deepEqual(toPlainValue(context.getStoredTasks()), [existingTask, newTask]);
});


test("updates only the task with the matching id", () => {
  const firstTask = { id: "task-1", title: "First", status: "todo" };
  const secondTask = { id: "task-2", title: "Second", status: "todo" };
  const { context } = createTaskContext([firstTask, secondTask]);
  context.updateStoredTask({ ...secondTask, status: "done" });
  const expectedTasks = [firstTask, { ...secondTask, status: "done" }];
  assert.deepEqual(toPlainValue(context.getStoredTasks()), expectedTasks);
});


test("deletes only the task with the matching id", () => {
  const firstTask = { id: "task-1", title: "Keep me" };
  const secondTask = { id: "task-2", title: "Delete me" };
  const { context } = createTaskContext([firstTask, secondTask]);
  context.deleteStoredTask(secondTask.id);
  assert.deepEqual(toPlainValue(context.getStoredTasks()), [firstTask]);
});


test("normalizes ISO and legacy task dates", () => {
  const { context } = createTaskContext();
  assert.equal(context.normalizeTaskDueDate("2026-07-15"), "2026-07-15");
  assert.equal(context.normalizeTaskDueDate("15/07/2026"), "2026-07-15");
  assert.equal(context.formatTaskDueDate("2026-07-15"), "15/07/2026");
});


test("rejects impossible or unsupported task dates", () => {
  const { context } = createTaskContext();
  assert.equal(context.normalizeTaskDueDate("2026-02-31"), "");
  assert.equal(context.normalizeTaskDueDate("July 15, 2026"), "");
  assert.equal(context.parseTaskDueDate("not-a-date"), null);
});


test("uses the Firebase adapter when it is available", async () => {
  const calls = [];
  const firebaseTasks = {
    async updateTask(taskId, task) {
      calls.push({ taskId, task });
    },
  };
  const { context, localStorage } = createFirebaseTaskContext(firebaseTasks);
  const task = { id: "task-1", title: "Move me", status: "done" };
  await context.updateTaskInStore(task);
  assert.deepEqual(calls, [{ taskId: task.id, task }]);
  assert.equal(localStorage.getItem(TASK_STORAGE_KEY), null);
});
