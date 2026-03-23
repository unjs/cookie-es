// Based on https://github.com/jshttp/cookie (MIT)
// Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
// Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
// Last sync: e264dfa

import { describe, it, expect } from "vitest";
import { parseSetCookie } from "../src";
import { parseSetCookie as parseSetCookieLegacy } from "../src/set-cookie/parse.ts";

describe("parseSetCookie", () => {
  it("should parse a simple set-cookie header", () => {
    expect(parseSetCookie("foo=bar;")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should parse a complex set-cookie header", () => {
    expect(
      parseSetCookie(
        "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure",
      ),
    ).toStrictEqual({
      name: "foo",
      value: "bar",
      path: "/",
      expires: new Date("Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)"),
      maxAge: 1000,
      domain: ".example.com",
      secure: true,
      httpOnly: true,
    });
  });

  it("should parse a weird but valid cookie", () => {
    expect(
      parseSetCookie(
        "foo=bar=bar&foo=foo&John=Doe&Doe=John; Max-Age=1000; Domain=.example.com; Path=/; HttpOnly; Secure",
      ),
    ).toStrictEqual({
      name: "foo",
      value: "bar=bar&foo=foo&John=Doe&Doe=John",
      path: "/",
      maxAge: 1000,
      domain: ".example.com",
      secure: true,
      httpOnly: true,
    });
  });

  it("should parse a cookie with percent-encoding in the data", () => {
    const cookieStr = "foo=asdf%3Basdf%3Dtrue%3Basdf%3Dasdf%3Basdf%3Dtrue%40asdf";

    expect(parseSetCookie(cookieStr)).toStrictEqual({
      name: "foo",
      value: "asdf;asdf=true;asdf=asdf;asdf=true@asdf",
    });

    // Use identity decode to get raw value
    expect(parseSetCookie(cookieStr, { decode: (v) => v })).toStrictEqual({
      name: "foo",
      value: "asdf%3Basdf%3Dtrue%3Basdf%3Dasdf%3Basdf%3Dtrue%40asdf",
    });
  });

  it("should handle the case when value is not UTF-8 encoded", () => {
    expect(
      parseSetCookie(
        "foo=R%F3r%EB%80%8DP%FF%3B%2C%23%9A%0CU%8E%A2C8%D7%3C%3C%B0%DF%17%60%F7Y%DB%16%8BQ%D6%1A",
        {},
      ),
    ).toStrictEqual({
      name: "foo",
      value: "R%F3r%EB%80%8DP%FF%3B%2C%23%9A%0CU%8E%A2C8%D7%3C%3C%B0%DF%17%60%F7Y%DB%16%8BQ%D6%1A",
    });
  });

  it("should have empty name string, and value is the name-value-pair if the name-value-pair string lacks a = character", () => {
    expect(parseSetCookie("foo;")).toStrictEqual({ name: "", value: "foo" });

    expect(parseSetCookie("foo;SameSite=None;Secure")).toStrictEqual({
      name: "",
      value: "foo",
      sameSite: "none",
      secure: true,
    });
  });

  it("should trim attribute values", () => {
    expect(parseSetCookie("foo=bar; Path= /foo ; Domain= .example.com ")).toStrictEqual({
      name: "foo",
      value: "bar",
      path: "/foo",
      domain: ".example.com",
    });
  });

  it("should ignore invalid sameSite values", () => {
    expect(parseSetCookie("foo=bar; SameSite=Invalid")).toStrictEqual({
      name: "foo",
      value: "bar",
    });

    expect(parseSetCookie("foo=bar; SameSite=Lax")).toStrictEqual({
      name: "foo",
      value: "bar",
      sameSite: "lax",
    });
  });

  it("should parse priority attribute", () => {
    expect(parseSetCookie("foo=bar; Priority=High")).toStrictEqual({
      name: "foo",
      value: "bar",
      priority: "high",
    });

    expect(parseSetCookie("foo=bar; Priority=Invalid")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should parse partitioned attribute", () => {
    expect(parseSetCookie("foo=bar; Partitioned")).toStrictEqual({
      name: "foo",
      value: "bar",
      partitioned: true,
    });
  });

  it("should ignore max-age without value", () => {
    expect(parseSetCookie("foo=bar; Max-Age")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should ignore max-age with invalid value", () => {
    expect(parseSetCookie("foo=bar; Max-Age=abc")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should ignore expires with invalid date", () => {
    expect(parseSetCookie("foo=bar; Expires=not-a-date")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should ignore expires without value", () => {
    expect(parseSetCookie("foo=bar; Expires")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should ignore priority without value", () => {
    expect(parseSetCookie("foo=bar; Priority")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should ignore sameSite without value", () => {
    expect(parseSetCookie("foo=bar; SameSite")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should lowercase sameSite values", () => {
    expect(parseSetCookie("foo=bar; SameSite=Strict")).toStrictEqual({
      name: "foo",
      value: "bar",
      sameSite: "strict",
    });

    expect(parseSetCookie("foo=bar; SameSite=None")).toStrictEqual({
      name: "foo",
      value: "bar",
      sameSite: "none",
    });
  });

  it("should lowercase priority values", () => {
    expect(parseSetCookie("foo=bar; Priority=Low")).toStrictEqual({
      name: "foo",
      value: "bar",
      priority: "low",
    });
  });
});

describe("parseSetCookieLegacy", () => {
  it("should return undefined for forbidden cookie names", () => {
    expect(parseSetCookieLegacy("__proto__=evil")).toBeUndefined();
    expect(parseSetCookieLegacy("constructor=evil")).toBeUndefined();
    expect(parseSetCookieLegacy("toString=evil")).toBeUndefined();
  });

  it("should skip forbidden attribute keys", () => {
    expect(parseSetCookieLegacy("foo=bar; __proto__=evil; constructor=evil")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should parse partitioned attribute", () => {
    expect(parseSetCookieLegacy("foo=bar; Partitioned")).toStrictEqual({
      name: "foo",
      value: "bar",
      partitioned: true,
    });
  });

  it("should guard against NaN max-age", () => {
    expect(parseSetCookieLegacy("foo=bar; Max-Age=abc")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should guard against invalid expires", () => {
    expect(parseSetCookieLegacy("foo=bar; Expires=not-a-date")).toStrictEqual({
      name: "foo",
      value: "bar",
    });
  });

  it("should lowercase sameSite values", () => {
    expect(parseSetCookieLegacy("foo=bar; SameSite=Strict")).toStrictEqual({
      name: "foo",
      value: "bar",
      sameSite: "strict",
    });
  });

  it("should parse priority attribute", () => {
    expect(parseSetCookieLegacy("foo=bar; Priority=High")).toStrictEqual({
      name: "foo",
      value: "bar",
      priority: "high",
    });
  });

  it("should parse a complex set-cookie header", () => {
    expect(
      parseSetCookieLegacy(
        "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure",
      ),
    ).toStrictEqual({
      name: "foo",
      value: "bar",
      path: "/",
      expires: new Date("Tue, 01 Jul 2025 10:01:11 GMT"),
      maxAge: 1000,
      domain: ".example.com",
      secure: true,
      httpOnly: true,
    });
  });

  it("should store unknown attributes on cookie object", () => {
    expect(parseSetCookieLegacy("foo=bar; customattr=customvalue")).toStrictEqual({
      name: "foo",
      value: "bar",
      customattr: "customvalue",
    });
  });

  it("should return undefined for cookie without = in name-value pair", () => {
    expect(parseSetCookieLegacy("foobar")).toBeUndefined();
  });

  it("should set sameSite to undefined for invalid values", () => {
    const result = parseSetCookieLegacy("foo=bar; SameSite=Invalid");
    expect(result).toBeDefined();
    expect(result!.name).toBe("foo");
    expect(result!.value).toBe("bar");
    expect(result!.sameSite).toBeUndefined();
  });

  it("should set priority to undefined for invalid values", () => {
    const result = parseSetCookieLegacy("foo=bar; Priority=Invalid");
    expect(result).toBeDefined();
    expect(result!.name).toBe("foo");
    expect(result!.value).toBe("bar");
    expect(result!.priority).toBeUndefined();
  });

  it("should decode values by default", () => {
    expect(parseSetCookieLegacy("foo=hello%20world")).toStrictEqual({
      name: "foo",
      value: "hello world",
    });
  });

  it("should skip decode when decode is false", () => {
    expect(parseSetCookieLegacy("foo=hello%20world", { decode: false })).toStrictEqual({
      name: "foo",
      value: "hello%20world",
    });
  });
});
