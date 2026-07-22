/** Prepares one contact for the assignee option template. */
function getAssigneeOptionViewData(contact, isChecked = false) {
  return {
    id: contact.id,
    name: contact.name,
    initials: getInitials(contact.name),
    color: contact.color || "var(--color-primary-auth)",
    checkedAttribute: isChecked ? "checked" : "",
  };
}


/** Prepares one selected assignee avatar. */
function getAssigneeChipViewData(contact) {
  return {
    initials: getInitials(contact.name),
    color: contact.color || "var(--color-primary-auth)",
  };
}
