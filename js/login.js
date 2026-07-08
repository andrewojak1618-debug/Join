const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", handleLoginSubmit);

function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  if (email === "" || password === "") {
    showLoginError("Please fill in email and password.");
    return;
  }
  showLoginError("");
}

function showLoginError(message) {
  const errorElement = document.getElementById("loginError");
  errorElement.textContent = message;
}
