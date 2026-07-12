let appTopbarDocumentEventsReady = false;

/**
 * Initializes the user menu in the shared application topbar.
 */
function initAppTopbar() {
  const menuButton = getAppTopbarMenuButton();
  const logoutButton = document.getElementById("appTopbarLogoutButton");
  if (!menuButton || !logoutButton) return;

  menuButton.addEventListener("click", toggleAppTopbarMenu);
  logoutButton.addEventListener("click", handleAppTopbarLogout);
  bindAppTopbarDocumentEvents();
}

function bindAppTopbarDocumentEvents() {
  if (appTopbarDocumentEventsReady) return;

  document.addEventListener("click", closeAppTopbarMenuOnOutsideClick);
  document.addEventListener("keydown", closeAppTopbarMenuOnEscape);
  appTopbarDocumentEventsReady = true;
}

function toggleAppTopbarMenu() {
  const menu = getAppTopbarMenu();
  if (!menu) return;

  setAppTopbarMenuOpen(menu.hidden);
}

function closeAppTopbarMenuOnOutsideClick(event) {
  const userActions = document.querySelector(".summary-user-actions");
  if (userActions && !userActions.contains(event.target)) {
    setAppTopbarMenuOpen(false);
  }
}

function closeAppTopbarMenuOnEscape(event) {
  if (event.key !== "Escape" || !isAppTopbarMenuOpen()) return;

  setAppTopbarMenuOpen(false);
  getAppTopbarMenuButton().focus();
}

async function handleAppTopbarLogout() {
  setAppTopbarMenuOpen(false);
  await handleLogout();
}

function setAppTopbarMenuOpen(isOpen) {
  const menu = getAppTopbarMenu();
  const menuButton = getAppTopbarMenuButton();
  if (!menu || !menuButton) return;

  menu.hidden = !isOpen;
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute(
    "aria-label",
    isOpen ? "Close user menu" : "Open user menu",
  );

  if (isOpen) menu.querySelector("a, button").focus();
}

function isAppTopbarMenuOpen() {
  const menu = getAppTopbarMenu();
  return Boolean(menu && !menu.hidden);
}

function getAppTopbarMenu() {
  return document.getElementById("appTopbarMenu");
}

function getAppTopbarMenuButton() {
  return document.getElementById("appTopbarMenuButton");
}
