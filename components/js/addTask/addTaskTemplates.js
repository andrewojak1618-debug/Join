/** Creates one prepared contact option for the assignee dropdown. */
function getAssigneeOptionTemplate(contact) {
  return `
    <label class="contact-dropdown__option">
      <span class="contact-dropdown__avatar" style="background-color: ${escapeHtmlText(contact.color)}">
        ${contact.initials}
      </span>
      <span>${escapeHtmlText(contact.name)}</span>
      <input type="checkbox" value="${escapeHtmlText(contact.id)}" ${contact.checkedAttribute} />
    </label>`;
}


/** Returns one prepared selected-contact avatar chip. */
function getAssigneeChipTemplate(contact) {
  return `<span class="contact-dropdown__avatar" style="background-color: ${escapeHtmlText(contact.color)}">${contact.initials}</span>`;
}


/** Returns the optional hidden-assignee counter. */
function getAssigneeOverflowChipTemplate(overflowCount) {
  if (!overflowCount) return "";
  return `<span class="contact-dropdown__avatar contact-dropdown__avatar--overflow">+${overflowCount}</span>`;
}


/** Returns one prepared subtask row in view mode. */
function getSubtaskItemTemplate(subtask, index) {
  return `
    <li class="add-task-subtask" data-subtask-index="${index}">
      <span class="add-task-subtask__title">${escapeHtmlText(subtask.title)}</span>
      <span class="add-task-subtask__actions">
        <button type="button" class="add-task-subtask__action" data-subtask-action="edit" aria-label="Edit subtask">
          <img src="./components/assets/img/icons/edit.svg" alt="" />
        </button>
        <span class="add-task-subtask__divider" aria-hidden="true"></span>
        <button type="button" class="add-task-subtask__action" data-subtask-action="delete" aria-label="Delete subtask">
          <img src="./components/assets/img/icons/delete.svg" alt="" />
        </button>
      </span>
    </li>`;
}


/** Returns one prepared subtask row in edit mode. */
function getSubtaskEditTemplate(subtask, index) {
  return `
    <li class="add-task-subtask add-task-subtask--editing" data-subtask-index="${index}">
      <input class="add-task-subtask__edit" type="text" value="${escapeHtmlText(subtask.title)}" data-subtask-edit aria-label="Edit subtask" />
      <span class="add-task-subtask__actions">
        <button type="button" class="add-task-subtask__action" data-subtask-action="delete" aria-label="Delete subtask">
          <img src="./components/assets/img/icons/delete.svg" alt="" />
        </button>
        <span class="add-task-subtask__divider" aria-hidden="true"></span>
        <button type="button" class="add-task-subtask__action" data-subtask-action="save" aria-label="Save subtask">
          <img src="./components/assets/img/icons/check_edit_subtask.svg" alt="" />
        </button>
      </span>
    </li>`;
}
