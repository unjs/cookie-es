// Based on https://github.com/nfriedly/set-cookie-parser (MIT)
// Copyright (c) 2015 Nathan Friedly <nathan@nfriedly.com> (http://nfriedly.com/)
// Last sync: v2.6.0 830debeeeec2ee21a36256bdef66485879dd18cd

import { describe, it, expect } from "vitest";
import { splitSetCookieString } from "../src";

const array = ["a", "b"];

const cookieNoParams = "sessionid=6ky4pkr7qoi4me7rwleyvxjove25huef";
const cookieWithParams = `${cookieNoParams}; HttpOnly; Path=/`;
const cookieWithExpires =
  "cid=70125eaa-399a-41b2-b235-8a5092042dba; expires=Thu, 04-Jun-2020 12:17:56 GMT; Max-Age=63072000; Path=/; HttpOnly; Secure";
const cookieWithExpiresAtEnd =
  "client_id=70125eaa-399a-41b2-b235-8a5092042dba; Max-Age=63072000; Path=/; expires=Thu, 04-Jun-2020 12:17:56 GMT";
const jsonCookie = `myJsonCookie=${JSON.stringify({
  foo: "bar",
  arr: [1, 2, 3],
})}`;
const jsonCookieWithParams = `${jsonCookie}; expires=Thu, 04-Jun-2020 12:17:56 GMT; Max-Age=63072000; Path=/; HttpOnly; Secure`;

const firstWithParamSecondNoParam = `${cookieWithParams}, ${cookieNoParams}`;
const threeNoParams = `${cookieNoParams}, ${cookieNoParams}, ${cookieNoParams}`;
const threeWithParams = `${cookieWithParams}, ${cookieWithParams}, ${cookieWithParams}`;
const firstWithExpiresSecondNoParam = `${cookieWithExpires}, ${cookieNoParams}`;
const firstWithExpiresSecondWithParam = `${cookieWithExpires}, ${cookieWithParams}`;
const firstWithExpiresAtEndSecondNoParam = `${cookieWithExpiresAtEnd}, ${cookieNoParams}`;
const firstWithExpiresAtEndSecondWithParam = `${cookieWithExpiresAtEnd}, ${cookieWithParams}`;
const firstWithExpiresSecondWithExpires = `${cookieWithExpires}, ${cookieWithExpires}`;
const firstWithExpiresSecondWithExpiresAtEnd = `${cookieWithExpires}, ${cookieWithExpiresAtEnd}`;
const firstWithExpiresAtEndSecondWithExpires = `${cookieWithExpiresAtEnd}, ${cookieWithExpires}`;
const firstWithExpiresAtEndSecondWithExpiresAtEnd = `${cookieWithExpiresAtEnd}, ${cookieWithExpiresAtEnd}`;
const firstWithExpiresSecondWithExpiresAtEndThirdWithExpires = `${cookieWithExpires}, ${cookieWithExpiresAtEnd}, ${cookieWithExpires}`;
const firstWithExpiresSecondWithExpiresAtEndThirdWithExpiresAtEnd = `${cookieWithExpires}, ${cookieWithExpiresAtEnd}, ${cookieWithExpiresAtEnd}`;
const threeWithExpires = `${cookieWithExpires}, ${cookieWithExpires}, ${cookieWithExpires}`;
const threeWithExpiresAtEnd = `${cookieWithExpiresAtEnd}, ${cookieWithExpiresAtEnd}, ${cookieWithExpiresAtEnd}`;

describe("splitSetCookieString", function () {
  it("should return array if Array", function () {
    const actual = splitSetCookieString(array);
    const expected = array;
    expect(actual).toStrictEqual(expected);
  });

  it("should return empty array on non string type", function () {
    const actual = splitSetCookieString(1);
    const expected = [];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse empty string", function () {
    const actual = splitSetCookieString("");
    const expected = [];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse single cookie without params", function () {
    const actual = splitSetCookieString(cookieNoParams);
    const expected = [cookieNoParams];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse single cookie with params", function () {
    const actual = splitSetCookieString(cookieWithParams);
    const expected = [cookieWithParams];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse three cookies without params", function () {
    const actual = splitSetCookieString(threeNoParams);
    const expected = [cookieNoParams, cookieNoParams, cookieNoParams];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse Three with params", function () {
    const actual = splitSetCookieString(threeWithParams);
    const expected = [cookieWithParams, cookieWithParams, cookieWithParams];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with params, second without params", function () {
    const actual = splitSetCookieString(firstWithParamSecondNoParam);
    const expected = [cookieWithParams, cookieNoParams];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse single with expires", function () {
    const actual = splitSetCookieString(cookieWithExpires);
    const expected = [cookieWithExpires];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse single with expires at end", function () {
    const actual = splitSetCookieString(cookieWithExpiresAtEnd);
    const expected = [cookieWithExpiresAtEnd];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with expires, second without params", function () {
    const actual = splitSetCookieString(firstWithExpiresSecondNoParam);
    const expected = [cookieWithExpires, cookieNoParams];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with expires, second with params", function () {
    const actual = splitSetCookieString(firstWithExpiresSecondWithParam);
    const expected = [cookieWithExpires, cookieWithParams];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with expires at end, second without params", function () {
    const actual = splitSetCookieString(firstWithExpiresAtEndSecondNoParam);
    const expected = [cookieWithExpiresAtEnd, cookieNoParams];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with expires at end, second with params", function () {
    const actual = splitSetCookieString(firstWithExpiresAtEndSecondWithParam);
    const expected = [cookieWithExpiresAtEnd, cookieWithParams];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with expires, second with expires", function () {
    const actual = splitSetCookieString(firstWithExpiresSecondWithExpires);
    const expected = [cookieWithExpires, cookieWithExpires];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with expires, second with expires at end", function () {
    const actual = splitSetCookieString(firstWithExpiresSecondWithExpiresAtEnd);
    const expected = [cookieWithExpires, cookieWithExpiresAtEnd];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with expires at end, second with expires", function () {
    const actual = splitSetCookieString(firstWithExpiresAtEndSecondWithExpires);
    const expected = [cookieWithExpiresAtEnd, cookieWithExpires];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with expires at end, second with expires at end", function () {
    const actual = splitSetCookieString(
      firstWithExpiresAtEndSecondWithExpiresAtEnd,
    );
    const expected = [cookieWithExpiresAtEnd, cookieWithExpiresAtEnd];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with expires, second with expires at end, third with expires", function () {
    const actual = splitSetCookieString(
      firstWithExpiresSecondWithExpiresAtEndThirdWithExpires,
    );
    const expected = [
      cookieWithExpires,
      cookieWithExpiresAtEnd,
      cookieWithExpires,
    ];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse first with expires, second with expires at end, third with expires at end", function () {
    const actual = splitSetCookieString(
      firstWithExpiresSecondWithExpiresAtEndThirdWithExpiresAtEnd,
    );
    const expected = [
      cookieWithExpires,
      cookieWithExpiresAtEnd,
      cookieWithExpiresAtEnd,
    ];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse three with expires", function () {
    const actual = splitSetCookieString(threeWithExpires);
    const expected = [cookieWithExpires, cookieWithExpires, cookieWithExpires];
    expect(actual).toStrictEqual(expected);
  });

  it("should parse three with expires at end", function () {
    const actual = splitSetCookieString(threeWithExpiresAtEnd);
    const expected = [
      cookieWithExpiresAtEnd,
      cookieWithExpiresAtEnd,
      cookieWithExpiresAtEnd,
    ];
    expect(actual).toStrictEqual(expected);
  });

  it("should not split json", function () {
    const actual = splitSetCookieString(jsonCookie);
    const expected = [jsonCookie];
    expect(actual).toStrictEqual(expected);
  });

  it("should not split json with params", function () {
    const actual = splitSetCookieString(jsonCookieWithParams);
    const expected = [jsonCookieWithParams];
    expect(actual).toStrictEqual(expected);
  });
});
