// Dummy auth for the first project structure step.
// This only uses localStorage and must be replaced with real Firebase/Auth later.

function handleLogin(event) {
  event.preventDefault();
  saveStoredUser({ name: 'User', type: 'login' });
  window.location.href = './summary.html';
}


function handleSignup(event) {
  event.preventDefault();
  saveStoredUser({ name: getSignupName(), type: 'signup' });
  window.location.href = './summary.html';
}


function handleGuestLogin() {
  saveStoredUser({ name: 'Guest', type: 'guest' });
  window.location.href = './summary.html';
}


function handleLogout() {
  clearStoredUser();
  window.location.href = './index.html';
}


function protectPage() {
  if (!getStoredUser()) {
    window.location.href = './index.html';
  }
}


function getSignupName() {
  return document.getElementById('signupName').value.trim();
}

