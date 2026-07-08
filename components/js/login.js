function initLoginValidation() {
  const loginForm = document.getElementById("loginForm");
  const guestLoginButton = document.getElementById("guestLoginButton");

  if (!loginForm || !guestLoginButton) {
    return;
  }

  loginForm.addEventListener("submit", handleLoginSubmit);
  guestLoginButton.addEventListener("click", handleGuestLogin);
}


async function handleLoginSubmit(event) {
  event.preventDefault();

  const email = getLoginEmail();
  const password = getLoginPassword();

  if (!isLoginFormValid(email, password)) return;
  await submitLogin(email, password);
}


async function submitLogin(email, password) {
  try {
    showLoginError("");
    await handleLogin(email, password);
  } catch (error) {
    showLoginError(getAuthErrorMessage(error));
  }
}


function isLoginFormValid(email, password) {
  if (email === "" || password === "") {
    showLoginError("Please fill in email and password.");
    return false;
  }

  if (!isValidEmail(email)) {
    showLoginError("Please enter a valid email address.");
    return false;
  }

  return true;
}


function getLoginEmail() {
  return document.getElementById("loginEmail").value.trim();
}


function getLoginPassword() {
  return document.getElementById("loginPassword").value.trim();
}


function showLoginError(message) {
  const errorElement = document.getElementById("loginError");
  errorElement.textContent = message;
}


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
