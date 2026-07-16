window.joinFirebaseReady = loadFirebaseConfig();


/**
 * Loads the local Firebase config and then starts the Firebase adapter.
 */
async function loadFirebaseConfig() {
  try {
    const response = await fetch("./components/js/firebaseConfig.js");
    if (!response.ok) return handleFirebaseLoadFailure();
    await loadScript("./components/js/firebaseConfig.js");
    await import("./firebaseAuth.mjs");
    await import("./firebaseContacts.mjs");
    await import("./firebaseTasks.mjs");
    return window.joinFirebaseAuth.waitForAuthReady();
  } catch {
    return handleFirebaseLoadFailure();
  }
}


/**
 * Removes stale local auth data when Firebase cannot be loaded.
 */
function handleFirebaseLoadFailure() {
  clearStoredUser();
  return null;
}


/**
 * Adds a script tag dynamically so the ignored firebaseConfig.js can load.
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
