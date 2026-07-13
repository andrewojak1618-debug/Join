const ADD_TASK_FIELD_VALIDATORS = {
  taskTitle: {
    errorId: "taskTitleError",
    getMessage: getAddTaskTitleError,
  },
  taskDueDate: {
    errorId: "taskDueDateError",
    getMessage: getAddTaskDueDateError,
  },
  taskCategory: {
    errorId: "taskCategoryError",
    getMessage: getAddTaskCategoryError,
  },
};

let addTaskValidationAttempted = false;

/**
 * Adds field-level validation without relying on native browser messages.
 */
function initAddTaskFieldValidation(form) {
  form.addEventListener("focusout", handleAddTaskFieldBlur);
  updateCreateTaskButton();
}

function handleAddTaskFieldBlur(event) {
  const fieldId = event.target.id;
  if (!getAddTaskFieldValidator(fieldId)) return;
  validateAddTaskField(fieldId);
}

/**
 * Keeps visible errors and the button state synchronized while editing.
 */
function handleAddTaskValidationChange(fieldId) {
  updateCreateTaskButton();
  if (shouldRevalidateAddTaskField(fieldId)) validateAddTaskField(fieldId);
}

function shouldRevalidateAddTaskField(fieldId) {
  const validator = getAddTaskFieldValidator(fieldId);
  if (!validator) return false;
  return addTaskValidationAttempted || Boolean(getAddTaskError(validator).textContent);
}

/**
 * Shows all required-field errors and reports whether saving may continue.
 */
function validateAddTaskForm() {
  addTaskValidationAttempted = true;
  const isValid = Object.keys(ADD_TASK_FIELD_VALIDATORS)
    .map(validateAddTaskField)
    .every(Boolean);
  if (!isValid) focusFirstInvalidAddTaskField();
  return isValid;
}

function focusFirstInvalidAddTaskField() {
  document.querySelector('.add-task-field [aria-invalid="true"]')?.focus();
}

function validateAddTaskField(fieldId) {
  const validator = getAddTaskFieldValidator(fieldId);
  const message = validator.getMessage();
  setAddTaskFieldError(fieldId, validator.errorId, message);
  return !message;
}

function setAddTaskFieldError(fieldId, errorId, message) {
  document.getElementById(fieldId).setAttribute("aria-invalid", String(Boolean(message)));
  document.getElementById(errorId).textContent = message;
}

function getAddTaskFieldValidator(fieldId) {
  return ADD_TASK_FIELD_VALIDATORS[fieldId];
}

function getAddTaskError(validator) {
  return document.getElementById(validator.errorId);
}

function getAddTaskTitleError() {
  return getAddTaskTitle() ? "" : "Please enter a title.";
}

function getAddTaskDueDateError() {
  const input = document.getElementById("taskDueDate").value.trim();
  if (!input) return "Please enter a due date.";
  return getAddTaskDueDate() ? "" : "Enter a valid date in dd/mm/yyyy.";
}

function getAddTaskCategoryError() {
  return getAddTaskCategory() ? "" : "Please select a category.";
}

function isAddTaskFormValid() {
  return Object.values(ADD_TASK_FIELD_VALIDATORS).every(
    (validator) => !validator.getMessage(),
  );
}

function updateCreateTaskButton() {
  const button = document.getElementById("createTaskButton");
  if (!button) return;
  button.dataset.formValid = String(isAddTaskFormValid());
}

function setAddTaskSubmitPending(isPending) {
  const button = document.getElementById("createTaskButton");
  button.disabled = isPending;
  button.setAttribute("aria-busy", String(isPending));
  if (!isPending) updateCreateTaskButton();
}

function resetAddTaskFieldValidation() {
  addTaskValidationAttempted = false;
  Object.entries(ADD_TASK_FIELD_VALIDATORS).forEach(([fieldId, validator]) => {
    setAddTaskFieldError(fieldId, validator.errorId, "");
  });
  updateCreateTaskButton();
}
