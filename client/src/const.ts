export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Native auth: just point at the in-app /login route. No external OAuth portal.
export const getLoginUrl = (): string => "/login";
export const getSignupUrl = (): string => "/signup";
