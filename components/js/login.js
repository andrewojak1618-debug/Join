function initLoginValidation() {
  const loginForm = document.getElementById("loginForm");
  const guestLoginButton = document.getElementById("guestLoginButton");

  if (!loginForm || !guestLoginButton) {
    return;
  }

  loginForm.addEventListener("submit", handleLoginSubmit);
  guestLoginButton.addEventListener("click", handleGuestLogin);
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (email === "" || password === "") {
    showLoginError("Please fill in email and password.");
    return;
  }

  if (!isValidEmail(email)) {
    showLoginError("Please enter a valid email address.");
    return;
  }

  showLoginError("");
}

function showLoginError(message) {
  const errorElement = document.getElementById("loginError");
  errorElement.textContent = message;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
