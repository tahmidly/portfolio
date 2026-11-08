// SweetAlert2 dialogs styled to the studio (see .swal-studio in AdminPage.css).
// Loaded on demand so it never weighs on the initial bundle.

async function swal() {
  const { default: Swal } = await import("sweetalert2");
  return Swal;
}

const base = {
  buttonsStyling: false,
  reverseButtons: true,
  customClass: {
    popup: "swal-studio",
    title: "swal-studio-title",
    htmlContainer: "swal-studio-text",
    confirmButton: "admin-primary swal-studio-confirm",
    cancelButton: "admin-secondary swal-studio-cancel",
    input: "admin-input swal-studio-input",
    validationMessage: "swal-studio-validation",
    actions: "swal-studio-actions",
  },
  showClass: { popup: "swal-studio-in" },
  hideClass: { popup: "swal-studio-out" },
};

export async function confirmDanger({ title, text, confirmText = "Delete" }) {
  const Swal = await swal();
  const result = await Swal.fire({
    ...base,
    customClass: {
      ...base.customClass,
      confirmButton: "admin-danger swal-studio-confirm swal-studio-danger",
    },
    icon: "warning",
    iconColor: "#f87171",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    focusCancel: true,
  });
  return result.isConfirmed;
}

export async function showError(text, title = "Something went wrong") {
  const Swal = await swal();
  await Swal.fire({
    ...base,
    icon: "error",
    iconColor: "#f87171",
    title,
    text,
    confirmButtonText: "OK",
  });
}

export async function showToast(title, icon = "success") {
  const Swal = await swal();
  // Toasts use SweetAlert2's own toast layout; only colors/type are themed.
  // No backdrop, so nothing behind the toast is dimmed or blurred.
  await Swal.fire({
    toast: true,
    position: "bottom-end",
    icon,
    iconColor: icon === "success" ? "#4ade80" : "#f87171",
    title,
    showConfirmButton: false,
    timer: 2400,
    timerProgressBar: true,
    customClass: {
      container: "swal-studio-toast-container",
      popup: "swal-studio-toast",
      title: "swal-studio-toast-title",
      timerProgressBar: "swal-studio-toast-bar",
    },
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
}

/** Returns the trimmed URL, "" to remove the link, or null when cancelled. */
export async function promptLink(initial) {
  const Swal = await swal();
  const result = await Swal.fire({
    ...base,
    title: "Add link",
    input: "text",
    inputValue: initial || "https://",
    inputPlaceholder: "https://example.com",
    showCancelButton: true,
    showDenyButton: Boolean(initial && initial !== "https://"),
    denyButtonText: "Remove link",
    confirmButtonText: "Apply",
    cancelButtonText: "Cancel",
    customClass: {
      ...base.customClass,
      denyButton: "admin-danger swal-studio-deny",
    },
    inputValidator: (value) => {
      const v = (value || "").trim();
      if (!v) return "Enter a URL or press Remove link.";
      if (!/^(https?:|mailto:|\/(?!\/)|#)/i.test(v)) return "Use an http(s), mailto: or /relative link.";
      return undefined;
    },
  });
  if (result.isDenied) return "";
  if (!result.isConfirmed) return null;
  return String(result.value).trim();
}
