export function showToast(message, type = "info") {
  window.dispatchEvent(
    new CustomEvent("glowify-toast", {
      detail: { id: `${Date.now()}-${Math.random()}`, message, type }
    })
  );
}
