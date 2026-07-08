const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", handleLoginSubmit);

function handleLoginSubmit(event) {
  event.preventDefault();
}

function showLoginError(message) {
  const errorElement = document.getElementById("loginError");
  errorElement.textContent = message;
}
