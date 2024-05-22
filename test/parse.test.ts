import { describe, it, expect } from "vitest";
import { parse } from "../src";

describe("cookie.parse(str)", () => {
  it("should throw with no arguments", () => {
    expect(() => parse(undefined as any)).throws(
      /argument str must be a string/,
    );
  });

  it("should throw when not a string", () => {
    expect(() => parse(42 as any)).throws(/argument str must be a string/);
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
});

describe("cookie.parse(str, options)", () => {
  describe('with "decode" option', () => {
    it("should specify alternative value decoder", () => {
      expect(
        parse('foo="YmFy"', {
          decode: (v) => {
            return Buffer.from(v, "base64").toString();
          },
        }),
      ).toMatchObject({ foo: "bar" });
    });

    it("parse filter key", () => {
      expect(parse("a=1;b=2", {
        filter: (key) => key === "a"
      })).toMatchObject({ a: "1" });

      expect(parse("a=1;b=2"))
        .toMatchObject({ a: "1", b: "2" });
    })
  });
});
