let addTaskContacts = [];
let selectedTaskAssignees = [];
let assigneeOutsideClickReady = false;

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
 * Opens or closes the dropdown from the trigger button.
 */
function toggleAssigneeDropdown() {
  setAssigneeDropdownOpen(getAssigneePanel().hidden);
}


/**
 * Closes the dropdown when the user clicks outside of the component.
 *
 * @param {MouseEvent} event - Document click event.
 */
function closeAssigneeDropdownOnOutsideClick(event) {
  const dropdown = getAssigneeDropdown();
  if (dropdown && !dropdown.contains(event.target)) setAssigneeDropdownOpen(false);
}


/**
 * Applies the visual and accessibility state for the assignee dropdown.
 *
 * @param {boolean} isOpen - True to open, false to close the dropdown.
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


/**
 * @returns {HTMLElement} The assignee dropdown container.
 */
function getAssigneeDropdown() {
  return document.getElementById("taskAssigneesDropdown");
}


/**
 * @returns {HTMLElement} The button that toggles the assignee dropdown.
 */
function getAssigneeButton() {
  return document.getElementById("taskAssigneesButton");
}


/**
 * @returns {HTMLElement} The panel that lists all assignable contacts.
 */
function getAssigneePanel() {
  return document.getElementById("taskAssigneesPanel");
}


/**
 * @returns {HTMLElement} The container for the selected-contact chips.
 */
function getSelectedAssignees() {
  return document.getElementById("taskAssigneesSelected");
}