// Based on https://github.com/jshttp/cookie (MIT)
// Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
// Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
// Last sync: e264dfa

import { describe, it, expect } from "vitest";
import { parseSetCookie } from "../src";

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
    const cookieStr =
      "foo=asdf%3Basdf%3Dtrue%3Basdf%3Dasdf%3Basdf%3Dtrue%40asdf";

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
      value:
        "R%F3r%EB%80%8DP%FF%3B%2C%23%9A%0CU%8E%A2C8%D7%3C%3C%B0%DF%17%60%F7Y%DB%16%8BQ%D6%1A",
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
    expect(
      parseSetCookie("foo=bar; Path= /foo ; Domain= .example.com "),
    ).toStrictEqual({
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
});
