export const JWT_ACCESS_TOKEN_EXPIRES_IN = 60 * 15; // 15 minutes in seconds
export const JWT_REFRESH_TOKEN_EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days in seconds

export const COOKIE_JWT_ACCESS_TOKEN_EXPIRES_IN = JWT_ACCESS_TOKEN_EXPIRES_IN * 1000; // 15 minutes in milisseconds
export const COOKIE_JWT_REFRESH_TOKEN_EXPIRES_IN = JWT_REFRESH_TOKEN_EXPIRES_IN * 1000; // 7 day in milisseconds
