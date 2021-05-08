import { mergeEffect } from "../engine/actions/utils";

it("Merging action effects with and", () => {
  expect(mergeEffect("and")).toEqual("full");

  expect(mergeEffect("and", "full")).toEqual("full");
  expect(mergeEffect("and", "partial")).toEqual("partial");
  expect(mergeEffect("and", "none")).toEqual("none");

  expect(mergeEffect("and", "full", "full")).toEqual("full");
  expect(mergeEffect("and", "full", "partial")).toEqual("partial");
  expect(mergeEffect("and", "full", "none")).toEqual("partial");

  expect(mergeEffect("and", "partial", "full")).toEqual("partial");
  expect(mergeEffect("and", "partial", "partial")).toEqual("partial");
  expect(mergeEffect("and", "partial", "none")).toEqual("partial");
  
  expect(mergeEffect("and", "none", "full")).toEqual("partial");
  expect(mergeEffect("and", "none", "partial")).toEqual("partial");
  expect(mergeEffect("and", "none", "none")).toEqual("none");
});

it("Merging action effects with or", () => {
  expect(mergeEffect("or")).toEqual("none");

  expect(mergeEffect("or", "full")).toEqual("full");
  expect(mergeEffect("or", "partial")).toEqual("partial");
  expect(mergeEffect("or", "none")).toEqual("none");

  expect(mergeEffect("or", "full", "full")).toEqual("full");
  expect(mergeEffect("or", "full", "partial")).toEqual("full");
  expect(mergeEffect("or", "full", "none")).toEqual("full");

  expect(mergeEffect("or", "partial", "full")).toEqual("full");
  expect(mergeEffect("or", "partial", "partial")).toEqual("partial");
  expect(mergeEffect("or", "partial", "none")).toEqual("partial");
  
  expect(mergeEffect("or", "none", "full")).toEqual("full");
  expect(mergeEffect("or", "none", "partial")).toEqual("partial");
  expect(mergeEffect("or", "none", "none")).toEqual("none");
});
