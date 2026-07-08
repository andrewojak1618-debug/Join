async function handleLogin(email, password) {
  if (isFirebaseAuthReady()) {
    await loginWithFirebase(email, password);
    return;
  }
  saveStoredUser({ name: 'User', type: 'login' });
  navigateToPage('summary');
}


async function handleSignup(event) {
  event.preventDefault();
  if (!isSignupFormValid()) {
    showSignupMessage(getSignupErrorMessage());
    return;
  }
  await registerUser();
}


async function registerUser() {
  try {
    await saveSignedUpUser();
    navigateToPage('summary');
  } catch (error) {
    showSignupMessage(getAuthErrorMessage(error));
  }
}


async function saveSignedUpUser() {
  if (isFirebaseAuthReady()) {
    const user = await window.joinFirebaseAuth.registerFirebaseUser(getSignupName(), getSignupEmail(), getSignupPassword());
    saveStoredUser(user);
    return;
  }
  saveStoredUser({ name: getSignupName(), type: 'signup' });
}


async function loginWithFirebase(email, password) {
  const user = await window.joinFirebaseAuth.loginFirebaseUser(email, password);
  saveStoredUser(user);
  navigateToPage('summary');
}


function handleGuestLogin() {
  saveStoredUser({ name: 'Guest', type: 'guest' });
  navigateToPage('summary');
}


async function handleLogout() {
  if (isFirebaseAuthReady()) await window.joinFirebaseAuth.logoutFirebaseUser();
  clearStoredUser();
  navigateToPage('login');
}


function isFirebaseAuthReady() {
  return Boolean(window.joinFirebaseAuth);
}


function getAuthErrorMessage(error) {
  const code = error && error.code;
  if (code === 'auth/invalid-credential') return 'Please check your email and password.';
  if (code === 'auth/email-already-in-use') return 'This email address is already registered.';
  if (code === 'auth/weak-password') return 'Please use at least 6 characters.';
  return 'Authentication is currently not available.';
}


function initSignupValidation() {
  const form = document.getElementById('signupForm');
  if (!form) return;
  rememberPrivacyReturn();
  form.addEventListener('input', updateSignupButton);
  getPrivacyLink().addEventListener('click', rememberPrivacyOpened);
  getPrivacyCheckbox().addEventListener('change', updateSignupButton);
  syncPrivacyConsent();
}


function rememberPrivacyOpened() {
  sessionStorage.setItem('joinPrivacyOpened', 'true');
}


function rememberPrivacyReturn() {
  const params = new URLSearchParams(window.location.search);

  if (params.get('privacy') !== 'opened') {
    return;
  }

  rememberPrivacyOpened();
  params.delete('privacy');
  window.history.replaceState({}, '', `?${params.toString()}`);
}


function syncPrivacyConsent() {
  getPrivacyCheckbox().disabled = !hasOpenedPrivacyPolicy();
  updateSignupButton();
}


function updateSignupButton() {
  getSignupButton().disabled = !isSignupFormValid();
  if (isSignupFormValid()) showSignupMessage('');
}


function isSignupFormValid() {
  return Boolean(
    getSignupName() &&
    isEmailValid() &&
    getSignupPassword() &&
    passwordsMatch() &&
    hasOpenedPrivacyPolicy() &&
    getPrivacyCheckbox().checked
  );
}


function getSignupErrorMessage() {
  if (!getSignupName()) return 'Please enter your name.';
  if (!isEmailValid()) return 'Please enter a valid email address.';
  if (!getSignupPassword()) return 'Please enter a password.';
  if (!passwordsMatch()) return 'Your passwords do not match.';
  if (!hasOpenedPrivacyPolicy()) return 'Please open the Privacy Policy first.';
  if (!getPrivacyCheckbox().checked) return 'Please accept the Privacy Policy.';
  return '';
}


function isEmailValid() {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(getSignupEmail());
}


function passwordsMatch() {
  return getSignupPassword() === getSignupConfirmPassword();
}


function hasOpenedPrivacyPolicy() {
  return sessionStorage.getItem('joinPrivacyOpened') === 'true';
}


function getSignupName() {
  return document.getElementById('signupName').value.trim();
}


function getSignupEmail() {
  return document.getElementById('signupEmail').value.trim();
}


function getSignupPassword() {
  return document.getElementById('signupPassword').value;
}


function getSignupConfirmPassword() {
  return document.getElementById('signupConfirmPassword').value;
}


function getPrivacyCheckbox() {
  return document.getElementById('privacyAccepted');
}


function getPrivacyLink() {
  return document.getElementById('privacyPolicyLink');
}


function getSignupButton() {
  return document.getElementById('signupButton');
}


function showSignupMessage(message) {
  document.getElementById('signupMessage').textContent = message;
}
