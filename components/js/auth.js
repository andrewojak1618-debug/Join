/**
 * Uses Firebase login when available and falls back to the dummy login.
 */
async function handleLogin(email, password) {
  if (isFirebaseAuthReady()) {
    await loginWithFirebase(email, password);
    return;
  }
  saveStoredUser({ name: "User", type: "login" });
  navigateToPage("summary");
}

async function handleSignup(event) {
  event.preventDefault();
  if (!isSignupFormValid()) {
    showSignupMessage(getSignupErrorMessage());
    return;
  }
  await registerUser();
}

/**
 * Wraps signup saving so Firebase errors can be shown in the form.
 */
async function registerUser() {
  try {
    await saveSignedUpUser();
    navigateToPage("summary");
  } catch (error) {
    showSignupMessage(getAuthErrorMessage(error));
  }
}

/**
 * Saves a new signup through Firebase or the temporary dummy user.
 */
async function saveSignedUpUser() {
  if (isFirebaseAuthReady()) {
    const user = await window.joinFirebaseAuth.registerFirebaseUser(
      getSignupName(),
      getSignupEmail(),
      getSignupPassword(),
    );
    saveStoredUser(user);
    return;
  }
  saveStoredUser({ name: getSignupName(), type: "signup" });
}

/**
 * Stores the Firebase login result and opens the protected summary page.
 */
async function loginWithFirebase(email, password) {
  const user = await window.joinFirebaseAuth.loginFirebaseUser(email, password);
  saveStoredUser(user);
  navigateToPage("summary");
}

/**
 * Starts the guest login and shows a login message if Firebase rejects it.
 */
async function handleGuestLogin() {
  try {
    await loginGuestUser();
  } catch (error) {
    showLoginError(getAuthErrorMessage(error));
  }
}

/**
 * Uses Firebase Anonymous Auth for guests and keeps a dummy fallback.
 */
async function loginGuestUser() {
  if (isFirebaseAuthReady()) {
    const user = await window.joinFirebaseAuth.loginGuestFirebaseUser();
    saveStoredUser(user);
    navigateToPage("summary");
    return;
  }
  saveStoredUser({ name: "Guest", type: "guest" });
  navigateToPage("summary");
}

/**
 * Signs out from Firebase, clears the local user and returns to login.
 */
async function handleLogout() {
  if (isFirebaseAuthReady()) await window.joinFirebaseAuth.logoutFirebaseUser();
  clearStoredUser();
  navigateToPage("login");
}

/**
 * Checks whether the Firebase adapter finished loading on window.
 */
function isFirebaseAuthReady() {
  return Boolean(window.joinFirebaseAuth);
}

/**
 * Converts Firebase error codes into short messages for the auth forms.
 */
function getAuthErrorMessage(error) {
  const code = error && error.code;
  if (code === "auth/invalid-credential")
    return "Please check your email and password.";
  if (code === "auth/email-already-in-use")
    return "This email address is already registered.";
  if (code === "auth/weak-password") return "Please use at least 6 characters.";
  if (code === "auth/operation-not-allowed")
    return "This login method is not enabled yet.";
  if (code === "auth/network-request-failed")
    return "Please check your internet connection.";
  return "Authentication is currently not available.";
}

function initSignupValidation() {
  const form = document.getElementById("signupForm");
  if (!form) return;
  rememberPrivacyReturn();
  form.addEventListener("input", updateSignupButton);
  getPrivacyLink().addEventListener("click", rememberPrivacyOpened);
  getPrivacyCheckbox().addEventListener("change", updateSignupButton);
  syncPrivacyConsent();
}

function rememberPrivacyOpened() {
  sessionStorage.setItem("joinPrivacyOpened", "true");
}

function rememberPrivacyReturn() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("privacy") !== "opened") {
    return;
  }

  rememberPrivacyOpened();
  params.delete("privacy");
  window.history.replaceState({}, "", `?${params.toString()}`);
}

function syncPrivacyConsent() {
  getPrivacyCheckbox().disabled = !hasOpenedPrivacyPolicy();
  updateSignupButton();
}

function updateSignupButton() {
  getSignupButton().disabled = !isSignupFormValid();
  if (isSignupFormValid()) showSignupMessage("");
}

function isSignupFormValid() {
  return Boolean(
    getSignupName() &&
    isEmailValid() &&
    getSignupPassword() &&
    passwordsMatch() &&
    hasOpenedPrivacyPolicy() &&
    getPrivacyCheckbox().checked,
  );
}

function getSignupErrorMessage() {
  if (!getSignupName()) return "Please enter your name.";
  if (!isEmailValid()) return "Please enter a valid email address.";
  if (!getSignupPassword()) return "Please enter a password.";
  if (!passwordsMatch()) return "Your passwords do not match.";
  if (!hasOpenedPrivacyPolicy()) return "Please open the Privacy Policy first.";
  if (!getPrivacyCheckbox().checked) return "Please accept the Privacy Policy.";
  return "";
}

function isEmailValid() {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(getSignupEmail());
}

function passwordsMatch() {
  return getSignupPassword() === getSignupConfirmPassword();
}

function hasOpenedPrivacyPolicy() {
  return sessionStorage.getItem("joinPrivacyOpened") === "true";
}

function getSignupName() {
  return document.getElementById("signupName").value.trim();
}

function getSignupEmail() {
  return document.getElementById("signupEmail").value.trim();
}

function getSignupPassword() {
  return document.getElementById("signupPassword").value;
}

function getSignupConfirmPassword() {
  return document.getElementById("signupConfirmPassword").value;
}

function getPrivacyCheckbox() {
  return document.getElementById("privacyAccepted");
}

function getPrivacyLink() {
  return document.getElementById("privacyPolicyLink");
}

function getSignupButton() {
  return document.getElementById("signupButton");
}

function showSignupMessage(message) {
  document.getElementById("signupMessage").textContent = message;
}
