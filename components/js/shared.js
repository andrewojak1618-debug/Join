/**
 * @returns {Object|null} The signed-in user from localStorage, or null.
 */
function getStoredUser() {
  return JSON.parse(localStorage.getItem('joinUser'));
}


/**
 * Persists the signed-in user for other pages of the application.
 *
 * @param {Object} user - User object to store in localStorage.
 */
function saveStoredUser(user) {
  localStorage.setItem('joinUser', JSON.stringify(user));
}


/**
 * Removes the stored user on logout.
 */
function clearStoredUser() {
  localStorage.removeItem('joinUser');
}


/**
 * Escapes a value for safe interpolation into HTML templates.
 *
 * @param {*} value - Any value; it is converted to a string first.
 * @returns {string} Text with HTML special characters encoded.
 */
function escapeHtmlText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}