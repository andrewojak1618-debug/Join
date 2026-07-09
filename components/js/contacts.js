const CONTACT_STORAGE_KEY = "joinContacts";

/**
 * Renders the alphabetically grouped contact list on the contacts page.
 */
function initContacts() {
  const contactsList = document.getElementById("contactsList");
  if (!contactsList) return;
  const contacts = getContacts();
  const groups = groupContactsByLetter(sortContactsByName(contacts));
  contactsList.innerHTML = Object.keys(groups)
  .map((letter) => getContactGroupTemplate(letter, groups[letter]))
  .join("");
}

/**
 * Reads the locally saved contact list for the temporary localStorage step.
 */
function getContacts() {
  const storedContact = localStorage.getItem(CONTACT_STORAGE_KEY);
  return storedContact ? JSON.parse(storedContact) : [];
}

/**
 * Builds the avatar initials from the first and last name part.
 */
function getContactInitials(name) {
  const parts = name.split(" ");
  const initials = parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  return initials.toUpperCase();
}

/**
 * Returns a copy of the contact list sorted alphabetically by name.
 */
function sortContactsByName(contacts) {
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Groups sorted contacts by the first letter of their name.
 */
function groupContactsByLetter(contacts) {
  const groups = {};
  for (const contact of contacts) {
    const letter = contact.name.charAt(0).toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(contact);
  }
  return groups;
}
