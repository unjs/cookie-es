// Based on https://github.com/jshttp/cookie (MIT)
// Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
// Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
// Last sync: e264dfa

import { describe, it, expect } from "vitest";
import { parse } from "../src";

describe("cookie.parse(str)", () => {
  it("should return empty object for empty string", () => {
    expect(parse("")).toMatchObject({});
  });

  it("should parse cookie string to object", () => {
    expect(parse("foo=bar")).toMatchObject({ foo: "bar" });
    expect(parse("foo=123")).toMatchObject({ foo: "123" });
  });

  it("should ignore OWS", () => {
    expect(parse("FOO    = bar;   baz  =   raz")).toMatchObject({
      FOO: "bar",
      baz: "raz",
    });
  });

  it("should parse cookie with empty value", () => {
    expect(parse("foo= ; bar=")).toMatchObject({ foo: "", bar: "" });
  });

  it("should URL-decode values", () => {
    expect(parse("email=%20%22%2c%3b%2f")).toMatchObject({ email: ' ",;/' });
    expect(parse("foo=%1;bar=bar")).toMatchObject({ foo: "%1", bar: "bar" });
  });

  it("should return original value on escape error", () => {
    expect(parse("foo=%1;bar=bar")).toMatchObject({ foo: "%1", bar: "bar" });
  });

  it("should ignore cookies without value", () => {
    expect(parse("foo=bar;fizz  ;  buzz")).toMatchObject({ foo: "bar" });
    expect(parse("  fizz; foo=  bar")).toMatchObject({ foo: "bar" });
  });

  it("should ignore duplicate cookies", () => {
    expect(parse("foo=%1;bar=bar;foo=boo")).toMatchObject({
      foo: "%1",
      bar: "bar",
    });
    expect(parse("foo=false;bar=bar;foo=true")).toMatchObject({
      foo: "false",
      bar: "bar",
    });
    expect(parse("foo=;bar=bar;foo=boo")).toMatchObject({
      foo: "",
      bar: "bar",
    });
  });
  it("should return array for duplicate cookies when `allowMultiple` is set", () => {
    expect(parse("foo=%1;bar=bar;foo=boo", { allowMultiple: true })).toEqual({
      foo: ["%1", "boo"],
      bar: "bar",
    });
    expect(parse("foo=false;bar=bar;foo=true", { allowMultiple: true })).toEqual({
      foo: ["false", "true"],
      bar: "bar",
    });
    expect(parse("foo=;bar=bar;foo=boo", { allowMultiple: true })).toEqual({
      foo: ["", "boo"],
      bar: "bar",
    });
    expect(parse("foo=a;bar=bar;foo=b;foo=c", { allowMultiple: true })).toEqual({
      foo: ["a", "b", "c"],
      bar: "bar",
    });
  });
});

describe("cookie.parse(str, options)", () => {
  describe('with "decode" option', () => {
    it("should specify alternative value decoder", () => {
      expect(
        parse("foo=YmFy", {
          decode: (v) => {
            return atob(v);
          },
        }),
      ).toMatchObject({ foo: "bar" });
    });
  });

  describe('with "decodeName" option', () => {
    it("should decode URL-encoded cookie names", () => {
      expect(
        parse("user%40test.local=bar", {
          decodeName: decodeURIComponent,
        }),
      ).toMatchObject({ "user@test.local": "bar" });
    });

    it("should not affect names without encoding", () => {
      expect(
        parse("foo=bar", {
          decodeName: decodeURIComponent,
        }),
      ).toMatchObject({ foo: "bar" });
    });

    it("should decode names and values independently", () => {
      expect(
        parse("user%40host=val%20ue", {
          decodeName: decodeURIComponent,
        }),
      ).toMatchObject({ "user@host": "val ue" });
    });

    it("should propagate errors from decodeName", () => {
      expect(() =>
        parse("bad%ZZname=bar", {
          decodeName: decodeURIComponent,
        }),
      ).toThrow(URIError);
    });

    it("should apply filter after decodeName", () => {
      expect(
        parse("user%40a=1;user%40b=2", {
          decodeName: decodeURIComponent,
          filter: (key) => key === "user@a",
        }),
      ).toEqual({ "user@a": "1" });
    });
  });

  describe('with "filter" option', () => {
    it("parse filter key", () => {
      expect(
        parse("a=1;b=2", {
          filter: (key) => key === "a",
        }),
      ).toEqual({ a: "1" });

      expect(parse("a=1;b=2")).toEqual({ a: "1", b: "2" });
    });
  });
});
