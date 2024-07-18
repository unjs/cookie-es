export interface SetCookieParseOptions {
  /**
   * Custom decode function to use on cookie values.
   *
   * By default, `decodeURIComponent` is used.
   *
   * **Note:** If decoding fails, the original (undecoded) value will be used
   */
  decode?: (value: string) => string;
}

export interface SetCookie {
  /**
   * Cookie name
   */
  name: string;

  /**
   * Cookie value
   */
  value: string;

  /**
   * Cookie path
   */
  path?: string | undefined;

  /**
   * Absolute expiration date for the cookie
   */
  expires?: Date | undefined;

  /**
   * Relative max age of the cookie in seconds from when the client receives it (integer or undefined)
   *
   * Note: when using with express's res.cookie() method, multiply maxAge by 1000 to convert to milliseconds
   */
  maxAge?: number | undefined;

  /**
   * Domain for the cookie,
   * May begin with "." to indicate the named domain or any subdomain of it
   */
  domain?: string | undefined;

  /**
   * Indicates that this cookie should only be sent over HTTPs
   */
  secure?: boolean | undefined;

  /**
   * Indicates that this cookie should not be accessible to client-side JavaScript
   */
  httpOnly?: boolean | undefined;

  /**
   * Indicates a cookie ought not to be sent along with cross-site requests
   */
  sameSite?: string | undefined;

  [key: string]: unknown;
}
