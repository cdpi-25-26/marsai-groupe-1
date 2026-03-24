let navigateFn = null;

export function setNavigate(fn) {
  navigateFn = fn;
}

export function navigateTo(path) {
  if (navigateFn) {
    navigateFn(path, { replace: true });
  } else {
    window.location.href = path;
  }
}
