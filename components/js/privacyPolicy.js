/**
 * Initializes the privacy policy page with view mode and language toggles.
 */
function initPrivacyLanguageSwitch() {
  syncInternalPrivacyCopy();
  const privacyPages = document.querySelectorAll(".legal-page--privacy");
  const toggles = document.querySelectorAll(".language-switch__input");
  updatePrivacyViewMode();
  if (!privacyPages.length || !toggles.length) return;
  toggles.forEach((toggle) => {
    toggle.addEventListener("change", () =>
      updatePrivacyLanguage(privacyPages, toggle),
    );
  });
  updatePrivacyLanguage(privacyPages, toggles[0]);
}


/**
 * Applies one toggle state to all language switches and privacy pages.
 *
 * @param {NodeList} pages - Privacy page sections to translate.
 * @param {HTMLInputElement} activeToggle - The switch the user changed.
 */
function updatePrivacyLanguage(pages, activeToggle) {
  document.querySelectorAll(".language-switch__input").forEach((toggle) => {
    toggle.checked = activeToggle.checked;
  });
  pages.forEach((page) =>
    page.classList.toggle("legal-page--english", activeToggle.checked),
  );
}


/**
 * Clones the public privacy copy into the app-shell view once.
 */
function syncInternalPrivacyCopy() {
  const internalCopy = document.getElementById("privacyInternalCopy");
  const externalCopies = document.querySelectorAll(
    "#privacyExternalView .privacy-copy",
  );
  if (!internalCopy || !externalCopies.length || internalCopy.children.length)
    return;
  externalCopies.forEach((copy) => internalCopy.append(copy.cloneNode(true)));
}


/**
 * Shows the public or the app-shell view depending on the login state.
 */
function updatePrivacyViewMode() {
  const isInternalView = Boolean(getStoredUser());
  const externalView = document.getElementById("privacyExternalView");
  const internalView = document.getElementById("privacyInternalView");
  if (!externalView || !internalView) return;
  externalView.hidden = isInternalView;
  internalView.hidden = !isInternalView;
}
