const CONTACT_STORAGE_KEY = "joinContacts";


function initContacts() {
  const contactsList = document.getElementById("contactsList");
  if (!contactsList) return;
  const contacts = getContacts();
  contactsList.innerHTML = sortContactsByName(contacts)
    .map(getContactItemTemplate)
    .join("");
}


function getContacts() {
  const storedContact = localStorage.getItem(CONTACT_STORAGE_KEY);
  return storedContact ? JSON.parse(storedContact) : [];
}


function getContactInitials(name) {
  const parts = name.split(" ");
  const initials = parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  return initials.toUpperCase();
}


function sortContactsByName(contacts) {
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name));
}


function escapeContactText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
