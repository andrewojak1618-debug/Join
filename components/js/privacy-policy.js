function initPrivacyLanguageSwitch() {
  const page = document.querySelector(".legal-page--privacy");
  const toggle = document.getElementById("privacyLanguageToggle");

  if (!page || !toggle) {
    return;
  }

  toggle.addEventListener("change", () => updatePrivacyLanguage(page, toggle));
  updatePrivacyLanguage(page, toggle);
}

function updatePrivacyLanguage(page, toggle) {
  page.classList.toggle("legal-page--english", toggle.checked);
}
