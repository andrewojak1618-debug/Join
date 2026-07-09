function getStoredUser() {
  return JSON.parse(localStorage.getItem('joinUser'));
}


function saveStoredUser(user) {
  localStorage.setItem('joinUser', JSON.stringify(user));
}


function clearStoredUser() {
  localStorage.removeItem('joinUser');
}


function escapeHtmlText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}