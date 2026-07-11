function initPrivacyLanguageSwitch() {
  syncInternalPrivacyCopy();

  const privacyPages = document.querySelectorAll(".legal-page--privacy");
  const toggles = document.querySelectorAll(".language-switch__input");

  updatePrivacyViewMode();

  if (!privacyPages.length || !toggles.length) return;

  toggles.forEach((toggle) => {
    toggle.addEventListener("change", () => updatePrivacyLanguage(privacyPages, toggle));
  });
  updatePrivacyLanguage(privacyPages, toggles[0]);
}

function updatePrivacyLanguage(pages, activeToggle) {
  document.querySelectorAll(".language-switch__input").forEach((toggle) => {
    toggle.checked = activeToggle.checked;
  });
  pages.forEach((page) => page.classList.toggle("legal-page--english", activeToggle.checked));
}

function syncInternalPrivacyCopy() {
  const internalCopy = document.getElementById("privacyInternalCopy");
  const externalCopies = document.querySelectorAll("#privacyExternalView .privacy-copy");

  if (!internalCopy || !externalCopies.length || internalCopy.children.length) return;

  // Keep the legal copy single-sourced so the public and app-shell views cannot drift apart.
  externalCopies.forEach((copy) => internalCopy.append(copy.cloneNode(true)));
}

function updatePrivacyViewMode() {
  const isInternalView = Boolean(getStoredUser());
  const externalView = document.getElementById("privacyExternalView");
  const internalView = document.getElementById("privacyInternalView");

  if (!externalView || !internalView) return;
  externalView.hidden = isInternalView;
  internalView.hidden = !isInternalView;
}
