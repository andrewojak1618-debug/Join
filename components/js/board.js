let activeBoardTasks = [];
let activeBoardTaskId = "";
let draggedBoardTaskId = "";


/**
 * Loads tasks from the task store and wires the board interactions.
 */
async function initBoardTasks() {
  const taskLists = document.querySelectorAll("[data-board-status]");
  if (!taskLists.length) return;

  activeBoardTasks = await loadTasksFromStore();
  renderBoardColumns(activeBoardTasks);
  initBoardTaskDetails(activeBoardTasks);
  initBoardDropZones(taskLists);
  initBoardSearch();
}


/**
 * Renders every board column with the tasks matching its status.
 * @param {Object[]} tasks - All tasks shown on the board.
 */
function renderBoardColumns(tasks) {
  document.querySelectorAll("[data-board-status]").forEach((taskList) => {
    renderBoardColumn(taskList, tasks);
  });
}


/**
 * Fills one column with its task cards or an empty-state message.
 * @param {HTMLElement} taskList - The column's task list element.
 * @param {Object[]} tasks - All tasks shown on the board.
 */
function renderBoardColumn(taskList, tasks) {
  const status = taskList.dataset.boardStatus;
  const filteredTasks = tasks.filter((task) => task.status === status);
  taskList.innerHTML = filteredTasks.length
    ? filteredTasks.map(getBoardTaskTemplate).join("")
    : getBoardEmptyTemplate(status);
}


/**
 * Returns the empty-state markup for a column without tasks.
 * @param {string} status - The status of the empty column.
 * @returns {string} The empty-state HTML.
 */
function getBoardEmptyTemplate(status) {
  return `<p class="board-empty-state">No tasks ${formatBoardStatus(status)}</p>`;
}


/**
 * Adds click and keyboard handling for opening, closing and editing task details.
 */
function initBoardTaskDetails(tasks) {
  document.querySelectorAll(".board-card").forEach((card) => {
    card.addEventListener("click", () =>
      openBoardTaskDetail(card.dataset.taskId, tasks),
    );
    card.addEventListener("keydown", (event) =>
      handleBoardCardKey(event, card, tasks),
    );
    card.addEventListener("dragstart", (event) =>
      handleBoardDragStart(event, card),
    );
    card.addEventListener("dragend", handleBoardDragEnd);
  });
  initBoardDetailControls();
}


/**
 * Registers dragover, dragleave and drop handling on every board column.
 * @param {NodeList} taskLists - The task list elements of all columns.
 */
function initBoardDropZones(taskLists) {
  taskLists.forEach((taskList) => {
    if (taskList.dataset.dropEventsReady === "true") return;

    taskList.addEventListener("dragover", (event) =>
      handleBoardDragOver(event, taskList),
    );
    taskList.addEventListener("dragleave", (event) =>
      handleBoardDragLeave(event, taskList),
    );
    taskList.addEventListener("drop", (event) =>
      handleBoardDrop(event, taskList),
    );
    taskList.dataset.dropEventsReady = "true";
  });
}


/**
 * Allows dropping on a column and shows the drop highlight while dragging.
 * @param {DragEvent} event - The dragover event.
 * @param {HTMLElement} taskList - The column being dragged over.
 */
function handleBoardDragOver(event, taskList) {
  if (!draggedBoardTaskId) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  taskList.classList.add("board-task-list--dragover");
}


/**
 * Removes the drop highlight when the dragged card leaves a column.
 * @param {DragEvent} event - The dragleave event.
 * @param {HTMLElement} taskList - The column being left.
 */
function handleBoardDragLeave(event, taskList) {
  if (event.relatedTarget && taskList.contains(event.relatedTarget)) return;
  clearBoardDropFeedback(taskList);
}


/**
 * Handles dropping a dragged task card onto a board column.
 * @param {DragEvent} event - The drop event.
 * @param {HTMLElement} taskList - The task list the card was dropped on.
 */
async function handleBoardDrop(event, taskList) {
  event.preventDefault();
  const task = getDraggedBoardTask();
  if (!task) return;
  try {
    await moveBoardTaskToStatus(task, taskList.dataset.boardStatus);
  } catch (error) {
    console.error("Task status could not be updated.", error);
  } finally {
    draggedBoardTaskId = "";
    clearAllBoardDropFeedback();
  }
}


/**
 * Saves the task with its new status and refreshes the board columns.
 * @param {Object} task - The task being moved.
 * @param {string} status - The status of the target column.
 */
async function moveBoardTaskToStatus(task, status) {
  await updateTaskInStore({ ...task, status });
  await refreshBoardAfterDrop();
}


/**
 * Returns the task that is currently being dragged.
 * @returns {Object|undefined} The dragged task, if any.
 */
function getDraggedBoardTask() {
  return activeBoardTasks.find((task) => task.id === draggedBoardTaskId);
}


/**
 * Removes the drop highlight from one column.
 * @param {HTMLElement} taskList - The column to clear.
 */
function clearBoardDropFeedback(taskList) {
  taskList.classList.remove("board-task-list--dragover");
}


/**
 * Removes the drop highlight from all columns.
 */
function clearAllBoardDropFeedback() {
  document.querySelectorAll("[data-board-status]").forEach((taskList) => {
    clearBoardDropFeedback(taskList);
  });
}


/**
 * Reloads all tasks and re-renders the board after a drop.
 */
async function refreshBoardAfterDrop() {
  activeBoardTasks = await loadTasksFromStore();
  renderBoardColumns(activeBoardTasks);
  initBoardTaskDetails(activeBoardTasks);
}


/**
 * Wires all buttons and events of the task detail dialog once.
 */
function initBoardDetailControls() {
  const overlay = getBoardDetailOverlay();
  if (overlay.dataset.eventsReady === "true") return;
  getBoardDetailCloseButton().addEventListener("click", closeBoardTaskDetail);
  overlay.addEventListener("click", handleBoardDetailBackdrop);
  document.addEventListener("keydown", handleBoardDetailEscape);
  getBoardEditButton().addEventListener("click", showBoardEditMode);
  getBoardDeleteButton().addEventListener("click", handleBoardDeleteClick);
  getBoardEditCancelButton().addEventListener("click", showBoardDetailViewMode);
  getBoardEditForm().addEventListener("submit", handleBoardEditSubmit);
  getBoardDetailSubtasks().addEventListener("change", handleBoardDetailSubtaskChange);
  getBoardMobileStatusSelect().addEventListener("change", handleBoardMobileStatusChange);
  overlay.dataset.eventsReady = "true";
}


/**
 * Marks the card as dragged and stores its task id.
 * @param {DragEvent} event - The dragstart event.
 * @param {HTMLElement} card - The card being dragged.
 */
function handleBoardDragStart(event, card) {
  draggedBoardTaskId = card.dataset.taskId;
  card.classList.add("board-card--dragging");
  event.dataTransfer.setData("text/plain", draggedBoardTaskId);
}


/**
 * Resets the drag state and removes all drag and drop feedback.
 */
function handleBoardDragEnd() {
  clearActiveBoardDragCard();
  draggedBoardTaskId = "";
  clearAllBoardDropFeedback();
}


/**
 * Removes the dragging style from all board cards.
 */
function clearActiveBoardDragCard() {
  document.querySelectorAll(".board-card--dragging").forEach((card) => {
    card.classList.remove("board-card--dragging");
  });
}


/**
 * Opens the task detail when a card is activated via Enter or Space.
 * @param {KeyboardEvent} event - The keydown event.
 * @param {HTMLElement} card - The focused board card.
 * @param {Object[]} tasks - All tasks shown on the board.
 */
function handleBoardCardKey(event, card, tasks) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  openBoardTaskDetail(card.dataset.taskId, tasks);
}


/**
 * Opens the detail dialog for the task with the given id.
 * @param {string} taskId - The id of the task to show.
 * @param {Object[]} tasks - All tasks shown on the board.
 */
function openBoardTaskDetail(taskId, tasks) {
  const task = tasks.find((currentTask) => currentTask.id === taskId);
  if (!task) return;
  activeBoardTaskId = task.id;
  fillBoardTaskDetail(task);
  showBoardDetailViewMode();
  getBoardDetailOverlay().hidden = false;
}


/**
 * Closes the detail dialog and resets it to view mode.
 */
function closeBoardTaskDetail() {
  getBoardDetailOverlay().hidden = true;
  activeBoardTaskId = "";
  showBoardDetailViewMode();
}


/**
 * Closes the detail dialog when the backdrop is clicked.
 * @param {MouseEvent} event - The click event.
 */
function handleBoardDetailBackdrop(event) {
  if (event.target === getBoardDetailOverlay()) closeBoardTaskDetail();
}


/**
 * Closes the detail dialog when the Escape key is pressed.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleBoardDetailEscape(event) {
  if (event.key === "Escape") closeBoardTaskDetail();
}


/**
 * Fills the task detail dialog with the content of the given task.
 * @param {Object} task - The task shown in the detail view.
 */
function fillBoardTaskDetail(task) {
  setBoardDetailText(
    "boardTaskDetailCategory",
    formatBoardCategory(task.category),
  );
  setBoardDetailText("boardTaskDetailTitle", task.title);
  setBoardDetailText(
    "boardTaskDetailDescription",
    task.description || "No description",
  );
  fillBoardDetailMetaFields(task);
  renderBoardDetailSubtasks(task);
}


/**
 * Fills the meta fields (due date, priority, status, assignee) of the task detail dialog.
 * @param {Object} task - The task providing the meta information.
 */
function fillBoardDetailMetaFields(task) {
  setBoardDetailText(
    "boardTaskDetailDueDate",
    formatTaskDueDate(task.dueDate) || "-",
  );
  setBoardDetailText("boardTaskDetailPriority", task.priority || "-");
  setBoardDetailText("boardTaskDetailStatus", formatBoardStatus(task.status));
  syncBoardMobileStatus(task.status);
  setBoardDetailText(
    "boardTaskDetailAssignee",
    task.assignedTo || "Not assigned",
  );
}


/**
 * Switches the detail dialog to edit mode with the active task's data.
 */
async function showBoardEditMode() {
  const task = getActiveBoardTask();
  if (!task) return;
  await fillBoardTaskEditForm(task);
  getBoardDetailView().hidden = true;
  getBoardEditForm().hidden = false;
}


/**
 * Switches the detail dialog back to the read-only view.
 */
function showBoardDetailViewMode() {
  getBoardDetailView().hidden = false;
  getBoardEditForm().hidden = true;
}


/**
 * Fills the edit form fields with the values of the given task.
 * @param {Object} task - The task being edited.
 */
async function fillBoardTaskEditForm(task) {
  getBoardEditField("Title").value = task.title || "";
  getBoardEditField("Description").value = task.description || "";
  getBoardEditField("DueDate").value = normalizeTaskDueDate(task.dueDate);
  getBoardEditField("Category").value = task.category || "user-story";
  getBoardEditField("Priority").value = task.priority || "medium";
  getBoardEditField("Status").value = task.status || "todo";
  await renderBoardEditAssignees(task.assignedTo);
  getBoardEditField("Subtasks").value = formatBoardSubtasksForEdit(
    task.subtasks,
  );
}


/**
 * Deletes the active task and re-renders the board.
 */
async function handleBoardDeleteClick() {
  if (!activeBoardTaskId) return;
  try {
    await deleteTaskFromStore(activeBoardTaskId);
    closeBoardTaskDetail();
    await initBoardTasks();
  } catch (error) {
    console.error("Task could not be deleted.", error);
  }
}


/**
 * Saves the edited task and refreshes the board and detail view.
 * @param {Event} event - The form submit event.
 */
async function handleBoardEditSubmit(event) {
  event.preventDefault();
  const task = getActiveBoardTask();
  if (!task) return;
  const updatedTask = getBoardEditedTask(task);
  try {
    await updateTaskInStore(updatedTask);
    await refreshBoardAfterEdit(updatedTask.id);
  } catch (error) {
    console.error("Task could not be updated.", error);
  }
}


/**
 * Builds the updated task object from the edit form values.
 * @param {Object} task - The original task being edited.
 * @returns {Object} The task with the edited values applied.
 */
function getBoardEditedTask(task) {
  return {
    ...task,
    title: getBoardEditField("Title").value.trim(),
    description: getBoardEditField("Description").value.trim(),
    dueDate: normalizeTaskDueDate(getBoardEditField("DueDate").value),
    category: getBoardEditField("Category").value,
    priority: getBoardEditField("Priority").value,
    status: getBoardEditField("Status").value,
    assignedTo: getBoardEditedAssignees(),
    subtasks: getBoardEditedSubtasks(),
  };
}


/**
 * Reads the subtasks from the edit form, keeping the done state of existing ones.
 * @returns {Object[]} The edited subtasks.
 */
function getBoardEditedSubtasks() {
  const previousSubtasks = getActiveBoardSubtasks();
  return getBoardEditField("Subtasks")
    .value.split("\n")
    .map(getTrimmedText)
    .filter(Boolean)
    .map((title) => toBoardSubtask(title, previousSubtasks));
}


/**
 * Returns the subtasks of the active task or an empty array.
 * @returns {Object[]} The subtasks of the active task.
 */
function getActiveBoardSubtasks() {
  const activeTask = getActiveBoardTask();
  return activeTask && Array.isArray(activeTask.subtasks)
    ? activeTask.subtasks
    : [];
}


/**
 * Returns the assignees selected in the edit form.
 * @returns {string} The selected assignee names.
 */
function getBoardEditedAssignees() {
  return getBoardEditedAssigneesFromContacts();
}


/**
 * Removes leading and trailing whitespace from a text.
 * @param {string} text - The text to trim.
 * @returns {string} The trimmed text.
 */
function getTrimmedText(text) {
  return text.trim();
}


/**
 * Reloads the board after an edit and reopens the edited task's detail view.
 * @param {string} taskId - The id of the edited task.
 */
async function refreshBoardAfterEdit(taskId) {
  activeBoardTasks = await loadTasksFromStore();
  renderBoardColumns(activeBoardTasks);
  initBoardTaskDetails(activeBoardTasks);
  openBoardTaskDetail(taskId, activeBoardTasks);
}


/**
 * Returns the task currently shown in the detail dialog.
 * @returns {Object|undefined} The active task, if any.
 */
function getActiveBoardTask() {
  return activeBoardTasks.find((task) => task.id === activeBoardTaskId);
}


/**
 * Converts the subtasks into the line-based text used by the edit form.
 * @param {Object[]} subtasks - The subtasks of the task.
 * @returns {string} One subtask title per line.
 */
function formatBoardSubtasksForEdit(subtasks) {
  if (!subtasks || !subtasks.length) return "";
  return subtasks.map(getBoardSubtaskTitle).filter(Boolean).join("\n");
}


/**
 * Sets the text content of a detail dialog element.
 * @param {string} elementId - The id of the target element.
 * @param {string} text - The text to display.
 */
function setBoardDetailText(elementId, text) {
  document.getElementById(elementId).textContent = text;
}


/**
 * Returns the overlay element of the task detail dialog.
 * @returns {HTMLElement} The detail overlay.
 */
function getBoardDetailOverlay() {
  return document.getElementById("boardTaskDetail");
}


/**
 * Returns the close button of the task detail dialog.
 * @returns {HTMLElement} The close button.
 */
function getBoardDetailCloseButton() {
  return document.getElementById("boardTaskDetailClose");
}


/**
 * Returns the read-only view container of the task detail dialog.
 * @returns {HTMLElement} The detail view container.
 */
function getBoardDetailView() {
  return document.getElementById("boardTaskDetailView");
}


/**
 * Returns the edit button of the task detail dialog.
 * @returns {HTMLElement} The edit button.
 */
function getBoardEditButton() {
  return document.getElementById("boardTaskEditButton");
}


/**
 * Returns the delete button of the task detail dialog.
 * @returns {HTMLElement} The delete button.
 */
function getBoardDeleteButton() {
  return document.getElementById("boardTaskDeleteButton");
}


/**
 * Returns the cancel button of the task edit form.
 * @returns {HTMLElement} The cancel button.
 */
function getBoardEditCancelButton() {
  return document.getElementById("boardTaskEditCancel");
}


/**
 * Returns the form element of the task edit mode.
 * @returns {HTMLElement} The edit form.
 */
function getBoardEditForm() {
  return document.getElementById("boardTaskEditForm");
}


/**
 * Returns an input element of the edit form by its field name.
 * @param {string} fieldName - The suffix of the field's element id.
 * @returns {HTMLElement} The form field element.
 */
function getBoardEditField(fieldName) {
  return document.getElementById(`boardTaskEdit${fieldName}`);
}


/**
 * Maps a category key to its readable display label.
 * @param {string} category - The category key of the task.
 * @returns {string} The category label.
 */
function formatBoardCategory(category) {
  const categoryLabels = {
    "technical-task": "Technical Task",
    "user-story": "User Story",
  };
  return categoryLabels[category] || "Task";
}


/**
 * Maps a status key to its readable display label.
 * @param {string} status - The status key of a column or task.
 * @returns {string} The status label.
 */
function formatBoardStatus(status) {
  const statusLabels = {
    todo: "to do",
    "in-progress": "in progress",
    feedback: "awaiting feedback",
    done: "done",
  };
  return statusLabels[status] || "here";
}


/**
 * Escapes HTML special characters to prevent markup injection.
 * @param {string} value - The raw text value.
 * @returns {string} The escaped text.
 */
function escapeBoardText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
