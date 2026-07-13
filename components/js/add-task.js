const ADD_TASK_REDIRECT_DELAY = 900;
const ADD_TASK_STATUSES = ["todo", "in-progress", "feedback", "done"];
let addTaskRedirectTimer;
let addTaskContacts = [];
let selectedTaskAssignees = [];
let assigneeOutsideClickReady = false;

/**
 * Initializes the Add Task form and its dynamic contact dropdown.
 */
async function initAddTaskValidation() {
  const form = document.getElementById("addTaskForm");
  if (!form) return;

  await initAddTaskAssignees();
  initAddTaskSubtasks();
  initAddTaskFieldValidation(form);
  form.addEventListener("input", handleAddTaskFormChange);
  form.addEventListener("change", handleAddTaskFormChange);
  form.addEventListener("reset", handleAddTaskReset);
  form.addEventListener("submit", handleAddTaskSubmit);
  updateCreateTaskButton();
}

/**
 * Saves the task through the task store and opens the board after success.
 */
async function handleAddTaskSubmit(event) {
  event.preventDefault();
  if (!validateAddTaskForm()) return;

  const form = event.currentTarget;
  setAddTaskSubmitPending(true);
  hideAddTaskErrorMessage();

  try {
    await createTaskInStore(getAddTaskData());
    form.reset();
    resetAddTaskAssignees();
    showAddTaskSuccessMessage();
    redirectToBoardAfterSuccess();
  } catch (error) {
    console.error("Task could not be saved.", error);
    setAddTaskSubmitPending(false);
    showAddTaskErrorMessage();
  }
}

/**
 * Clears stale success feedback when the user edits the form again.
 */
function handleAddTaskFormChange(event) {
  hideAddTaskSuccessMessage();
  hideAddTaskErrorMessage();
  clearAddTaskRedirect();
  handleAddTaskValidationChange(event?.target?.id);
}

/**
 * Updates the button state after the form was reset.
 */
function handleAddTaskReset() {
  setTimeout(() => {
    resetAddTaskAssignees();
    resetAddTaskSubtasks();
    resetAddTaskFieldValidation();
  }, 0);
}

/**
 * Shows the short confirmation before the board route opens.
 */
function showAddTaskSuccessMessage() {
  const message = getAddTaskSuccessMessage();
  if (!message) return;

  message.hidden = false;
}

/**
 * Hides the confirmation while the form is being edited.
 */
function hideAddTaskSuccessMessage() {
  const message = getAddTaskSuccessMessage();
  if (!message) return;

  message.hidden = true;
}

function showAddTaskErrorMessage() {
  const message = document.getElementById("addTaskErrorMessage");
  if (message) message.hidden = false;
}

function hideAddTaskErrorMessage() {
  const message = document.getElementById("addTaskErrorMessage");
  if (message) message.hidden = true;
}

/**
 * Opens the board after the user had a short moment to see the confirmation.
 */
function redirectToBoardAfterSuccess() {
  clearAddTaskRedirect();
  addTaskRedirectTimer = setTimeout(() => navigateToPage("board"), ADD_TASK_REDIRECT_DELAY);
}

function clearAddTaskRedirect() {
  if (addTaskRedirectTimer) clearTimeout(addTaskRedirectTimer);
}

function getAddTaskSuccessMessage() {
  return document.getElementById("addTaskSuccessMessage");
}

/**
 * Reads the current form values and creates the task object used by the board.
 */
function getAddTaskData() {
  return {
    id: createTaskId(),
    title: getAddTaskTitle(),
    description: getAddTaskDescription(),
    dueDate: getAddTaskDueDate(),
    priority: getAddTaskPriority(),
    assignedTo: getAddTaskAssignee(),
    category: getAddTaskCategory(),
    subtasks: getAddTaskSubtasks(),
    status: getAddTaskStatus(),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Uses a valid status passed by a board column and defaults to To do.
 */
function getAddTaskStatus() {
  const status = new URLSearchParams(window.location.search).get("status");
  return ADD_TASK_STATUSES.includes(status) ? status : "todo";
}

function createTaskId() {
  return `task-${Date.now()}`;
}

function getAddTaskTitle() {
  return document.getElementById("taskTitle").value.trim();
}

function getAddTaskDescription() {
  return document.getElementById("taskDescription").value.trim();
}

function getAddTaskDueDate() {
  const dueDate = document.getElementById("taskDueDate").value.trim();
  return normalizeTaskDueDate(dueDate);
}

function getAddTaskPriority() {
  return document.querySelector('input[name="taskPriority"]:checked').value;
}

function getAddTaskAssignee() {
  return selectedTaskAssignees.map((contact) => contact.name);
}

function getAddTaskCategory() {
  return document.getElementById("taskCategory").value;
}

/**
 * Loads available contacts and prepares the multi-select assignee dropdown.
 */
async function initAddTaskAssignees() {
  addTaskContacts = await loadAddTaskContacts();
  selectedTaskAssignees = [];
  renderAssigneeOptions();
  bindAssigneeDropdown();
  updateAssigneeSelection();
}

/**
 * Returns sorted contacts from Firestore or localStorage, with an empty fallback.
 */
async function loadAddTaskContacts() {
  try {
    return sortContactsByName(await loadContactsFromStore());
  } catch (error) {
    return [];
  }
}

/**
 * Wires dropdown opening once and keeps the document outside-click listener unique.
 */
function bindAssigneeDropdown() {
  getAssigneeButton().addEventListener("click", toggleAssigneeDropdown);
  if (assigneeOutsideClickReady) return;
  document.addEventListener("click", closeAssigneeDropdownOnOutsideClick);
  assigneeOutsideClickReady = true;
}

/**
 * Renders all assignable contacts as checkbox options.
 */
function renderAssigneeOptions() {
  const panel = getAssigneePanel();
  panel.innerHTML = addTaskContacts.length
    ? addTaskContacts.map(getAssigneeOptionTemplate).join("")
    : '<p class="contact-dropdown__empty">No contacts available.</p>';
  panel.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", handleAssigneeChange);
  });
}

/**
 * Creates one contact option for the assignee dropdown.
 *
 * @param {Object} contact - Contact object from the contacts store.
 * @returns {string} HTML markup for one selectable contact.
 */
function getAssigneeOptionTemplate(contact) {
  return `
    <label class="contact-dropdown__option">
      <input type="checkbox" value="${escapeHtmlText(contact.id)}" />
      <span class="contact-dropdown__avatar" style="background-color: ${escapeHtmlText(contact.color || "#2a3647")}">
        ${getContactInitials(contact.name)}
      </span>
      <span>${escapeHtmlText(contact.name)}</span>
    </label>
  `;
}

/**
 * Synchronizes selected checkbox ids with the in-memory selected contact list.
 */
function handleAssigneeChange() {
  selectedTaskAssignees = getCheckedAssigneeIds().map(getContactById).filter(Boolean);
  updateAssigneeSelection();
  handleAddTaskFormChange();
}

/**
 * Returns ids of all currently checked assignee options.
 */
function getCheckedAssigneeIds() {
  return [...getAssigneePanel().querySelectorAll("input:checked")].map((input) => input.value);
}

/**
 * Finds one loaded contact by id.
 *
 * @param {string} contactId - The contact id stored on the checkbox.
 * @returns {Object|undefined} Matching contact, if it is still available.
 */
function getContactById(contactId) {
  return addTaskContacts.find((contact) => contact.id === contactId);
}

/**
 * Updates every visible part of the current assignee selection.
 */
function updateAssigneeSelection() {
  updateAssigneeButtonText();
  renderSelectedAssigneeChips();
}

/**
 * Shows a compact selection summary inside the closed dropdown button.
 */
function updateAssigneeButtonText() {
  const count = selectedTaskAssignees.length;
  getAssigneeButton().textContent = count ? `${count} contact${count === 1 ? "" : "s"} selected` : "Select contacts to assign";
}

/**
 * Renders the selected contacts below the dropdown as small chips.
 */
function renderSelectedAssigneeChips() {
  getSelectedAssignees().innerHTML = selectedTaskAssignees.map(getAssigneeChipTemplate).join("");
}

/**
 * Returns a visible chip for one selected contact.
 *
 * @param {Object} contact - Selected contact object.
 * @returns {string} HTML markup for the selected-contact chip.
 */
function getAssigneeChipTemplate(contact) {
  return `<span class="contact-dropdown__chip">${escapeHtmlText(contact.name)}</span>`;
}

/**
 * Opens or closes the dropdown from the trigger button.
 */
function toggleAssigneeDropdown() {
  setAssigneeDropdownOpen(getAssigneePanel().hidden);
}

/**
 * Closes the dropdown when the user clicks outside of the component.
 */
function closeAssigneeDropdownOnOutsideClick(event) {
  const dropdown = getAssigneeDropdown();
  if (dropdown && !dropdown.contains(event.target)) setAssigneeDropdownOpen(false);
}

/**
 * Applies the visual and accessibility state for the assignee dropdown.
 */
function setAssigneeDropdownOpen(isOpen) {
  getAssigneeDropdown().classList.toggle("is-open", isOpen);
  getAssigneePanel().hidden = !isOpen;
  getAssigneeButton().setAttribute("aria-expanded", String(isOpen));
}

/**
 * Clears selected assignees after form reset or successful task creation.
 */
function resetAddTaskAssignees() {
  selectedTaskAssignees = [];
  getAssigneePanel().querySelectorAll("input").forEach((input) => {
    input.checked = false;
  });
  setAssigneeDropdownOpen(false);
  updateAssigneeSelection();
}

function getAssigneeDropdown() {
  return document.getElementById("taskAssigneesDropdown");
}

function getAssigneeButton() {
  return document.getElementById("taskAssigneesButton");
}

function getAssigneePanel() {
  return document.getElementById("taskAssigneesPanel");
}

function getSelectedAssignees() {
  return document.getElementById("taskAssigneesSelected");
}
