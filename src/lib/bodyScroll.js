let scrollLockCount = 0;
let originalBodyOverflow = "";

export function lockBodyScroll() {
  if (typeof document === "undefined" || !document.body) {
    return () => {};
  }

  if (scrollLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow || "";
    document.body.style.overflow = "hidden";
  }

  scrollLockCount += 1;

  return () => {
    if (typeof document === "undefined" || !document.body) {
      return;
    }

    scrollLockCount = Math.max(0, scrollLockCount - 1);

    if (scrollLockCount === 0) {
      document.body.style.overflow = originalBodyOverflow;
      originalBodyOverflow = "";
    }
  };
}

export function unlockBodyScroll() {
  if (typeof document === "undefined" || !document.body) {
    return;
  }

  scrollLockCount = Math.max(0, scrollLockCount - 1);

  if (scrollLockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
    originalBodyOverflow = "";
  }
}
