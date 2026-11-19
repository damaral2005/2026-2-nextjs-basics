export const DEFAULT_DASHBOARD_PATH = "/students";
export const CREATE_STUDENT_PATH = "/students/new";
export const TOKEN_COOKIE = "token";

export function safeDashboardPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return undefined;
  }

  const base = "https://internal.invalid";
  if (!URL.canParse(value, base)) return undefined;
  const url = new URL(value, base);
  const isDashboardPath =
    url.pathname === DEFAULT_DASHBOARD_PATH ||
    url.pathname.startsWith(`${DEFAULT_DASHBOARD_PATH}/`) ||
    url.pathname === "/counter";

  if (url.origin === base && isDashboardPath) {
    return `${url.pathname}${url.search}${url.hash}`;
  }
}

export function loginPath(from: string) {
  return `/login?${new URLSearchParams({ from })}`;
}
