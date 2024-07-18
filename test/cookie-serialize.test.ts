import { describe, it, expect } from "vitest";
import { serialize } from "../src";

describe("serialize(name, value)", () => {
  it("should serialize name and value", () => {
    expect(serialize("foo", "bar")).toBe("foo=bar");
  });

  it("should URL-encode value", () => {
    expect(serialize("foo", "bar +baz")).toBe("foo=bar%20%2Bbaz");
  });

  it("should serialize empty value", () => {
    expect(serialize("foo", "")).toBe("foo=");
  });

  it("should throw for invalid name", () => {
    expect(() => serialize("foo\n", "bar")).toThrow(/argument name is invalid/);
    expect(() => serialize("foo\u280A", "bar")).toThrow(
      /argument name is invalid/,
    );
  });
});

describe("serialize(name, value, options)", () => {
  describe('with "domain" option', () => {
    it("should serialize domain", () => {
      expect(serialize("foo", "bar", { domain: "example.com" })).toBe(
        "foo=bar; Domain=example.com",
      );
    });

    it("should throw for invalid value", () => {
      expect(() =>
        serialize("foo", "bar", { domain: "example.com\n" }),
      ).toThrow(/option domain is invalid/);
    });
  });

  describe('with "encode" option', () => {
    it("should throw on non-function value", () => {
      // @ts-expect-error
      expect(() => serialize("foo", "bar", { encode: 42 })).toThrow(
        /option encode is invalid/,
      );
    });

    it("should specify alternative value encoder", () => {
      expect(
        serialize("foo", "bar", {
          encode: (v) => {
            return btoa(v);
          },
        }),
      ).toBe("foo=YmFy");
    });

    it("should throw when returned value is invalid", () => {
      expect(() =>
        serialize("foo", "bar", {
          encode: () => {
            return "\n";
          },
        }),
      ).toThrow(/argument val is invalid/);
    });
  });

  describe('with "expires" option', () => {
    it("should throw on non-Date value", () => {
      // @ts-expect-error
      expect(() => serialize("foo", "bar", { expires: 42 })).toThrow(
        /option expires is invalid/,
      );
    });

    it("should throw on invalid date", () => {
      expect(() =>
        serialize("foo", "bar", { expires: new Date(Number.NaN) }),
      ).toThrow(/option expires is invalid/);
    });

    it("should set expires to given date", () => {
      expect(
        serialize("foo", "bar", {
          expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
        }),
      ).toBe("foo=bar; Expires=Sun, 24 Dec 2000 10:30:59 GMT");
    });
  });

  describe('with "httpOnly" option', () => {
    it("should include httpOnly flag when true", () => {
      expect(serialize("foo", "bar", { httpOnly: true })).toBe(
        "foo=bar; HttpOnly",
      );
    });

    it("should not include httpOnly flag when false", () => {
      expect(serialize("foo", "bar", { httpOnly: false })).toBe("foo=bar");
    });
  });

  describe('with "maxAge" option', () => {
    it("should throw when not a number", () => {
      // @ts-expect-error
      expect(() => serialize("foo", "bar", { maxAge: "buzz" })).toThrow(
        /option maxAge is invalid/,
      );
    });

    it("should throw when Infinity", () => {
      expect(() =>
        serialize("foo", "bar", { maxAge: Number.POSITIVE_INFINITY }),
      ).toThrow(/option maxAge is invalid/);
    });

    it("should set max-age to value", () => {
      expect(serialize("foo", "bar", { maxAge: 1000 })).toBe(
        "foo=bar; Max-Age=1000",
      );
      // @ts-expect-error
      expect(serialize("foo", "bar", { maxAge: "1000" })).toBe(
        "foo=bar; Max-Age=1000",
      );
      expect(serialize("foo", "bar", { maxAge: 0 })).toBe("foo=bar; Max-Age=0");
      // @ts-expect-error
      expect(serialize("foo", "bar", { maxAge: "0" })).toBe(
        "foo=bar; Max-Age=0",
      );
    });

    it("should set max-age to integer value", () => {
      expect(serialize("foo", "bar", { maxAge: 3.14 })).toBe(
        "foo=bar; Max-Age=3",
      );
      expect(serialize("foo", "bar", { maxAge: 3.99 })).toBe(
        "foo=bar; Max-Age=3",
      );
    });

    it("should not set when null", () => {
      // @ts-expect-error
      // eslint-disable-next-line unicorn/no-null
      expect(serialize("foo", "bar", { maxAge: null })).toBe("foo=bar");
    });
  });

  describe('with "path" option', () => {
    it("should serialize path", () => {
      expect(serialize("foo", "bar", { path: "/foo" })).toBe(
        "foo=bar; Path=/foo",
      );
    });

    it("should throw for invalid value", () => {
      expect(() => serialize("foo", "bar", { path: "/\n" })).toThrow(
        /option path is invalid/,
      );
    });
  });

  describe('with "priority" option', () => {
    it("should throw on invalid priority", () => {
      // @ts-expect-error
      expect(() => serialize("foo", "bar", { priority: "foo" })).toThrow(
        /option priority is invalid/,
      );
    });

    it("should throw on non-string", () => {
      // @ts-expect-error
      expect(() => serialize("foo", "bar", { priority: 42 })).toThrow(
        /option priority is invalid/,
      );
    });

    it("should set priority low", () => {
      expect(serialize("foo", "bar", { priority: "low" })).toBe(
        "foo=bar; Priority=Low",
      );
      // @ts-expect-error
      expect(serialize("foo", "bar", { priority: "loW" })).toBe(
        "foo=bar; Priority=Low",
      );
    });

    it("should set priority medium", () => {
      // @ts-expect-error
      expect(serialize("foo", "bar", { priority: "Medium" })).toBe(
        "foo=bar; Priority=Medium",
      );
      expect(serialize("foo", "bar", { priority: "medium" })).toBe(
        "foo=bar; Priority=Medium",
      );
    });

    it("should set priority high", () => {
      // @ts-expect-error
      expect(serialize("foo", "bar", { priority: "higH" })).toBe(
        "foo=bar; Priority=High",
      );
    });
  });

  describe('with "sameSite" option', () => {
    it("should throw on invalid sameSite", () => {
      // @ts-expect-error
      expect(() => serialize("foo", "bar", { sameSite: 42 })).toThrow(
        /option sameSite is invalid/,
      );
    });

    it("should set sameSite strict", () => {
      // @ts-expect-error
      expect(serialize("foo", "bar", { sameSite: "Strict" })).toBe(
        "foo=bar; SameSite=Strict",
      );
      expect(serialize("foo", "bar", { sameSite: "strict" })).toBe(
        "foo=bar; SameSite=Strict",
      );
    });

    it("should set sameSite lax", () => {
      expect(serialize("foo", "bar", { sameSite: "lax" })).toBe(
        "foo=bar; SameSite=Lax",
      );
      // @ts-expect-error
      expect(serialize("foo", "bar", { sameSite: "Lax" })).toBe(
        "foo=bar; SameSite=Lax",
      );
    });

    it("should set sameSite none", () => {
      // @ts-expect-error
      expect(serialize("foo", "bar", { sameSite: "None" })).toBe(
        "foo=bar; SameSite=None",
      );
      expect(serialize("foo", "bar", { sameSite: "none" })).toBe(
        "foo=bar; SameSite=None",
      );
    });

    it("should set sameSite strict when true", () => {
      expect(serialize("foo", "bar", { sameSite: true })).toBe(
        "foo=bar; SameSite=Strict",
      );
    });

    it("should not set sameSite when false", () => {
      expect(serialize("foo", "bar", { sameSite: false })).toBe("foo=bar");
    });
  });

  describe('with "secure" option', () => {
    it("should include secure flag when true", () => {
      expect(serialize("foo", "bar", { secure: true })).toBe("foo=bar; Secure");
    });

    it("should not include secure flag when false", () => {
      expect(serialize("foo", "bar", { secure: false })).toBe("foo=bar");
    });
  });

  describe('with "partitioned" option', () => {
    it("should include partitioned flag when true", () => {
      expect(serialize("foo", "bar", { partitioned: true })).toBe(
        "foo=bar; Partitioned",
      );
    });

    it("should not include partitioned flag when false", () => {
      expect(serialize("foo", "bar", { partitioned: false })).toBe("foo=bar");
    });
  });
});
