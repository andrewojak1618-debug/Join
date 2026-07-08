async function loadFirebaseConfig() {
  try {
    const response = await fetch("./components/js/firebase-config.js");
    if (!response.ok) return;
    await loadScript("./components/js/firebase-config.js");
    await import("./firebase-auth.mjs");
  } catch (error) {
    return;
  }
}


function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}


loadFirebaseConfig();