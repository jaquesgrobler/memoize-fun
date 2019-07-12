const memoization = require("./memoizaton");
const expect = require("chai").expect;

// hint: use https://sinonjs.org/releases/v6.1.5/fake-timers/ for faking timeouts

describe("memoization", function() {
  it("should memoize function result", () => {
    let returnValue = 5;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction, key => key, 1000);
    expect(memoized("c544d3ae-a72d-4755-8ce5-d25db415b776")).to.equal(5);

    returnValue = 10;

    // TODO currently fails, should work after implementing the memoize function, it should also work with other
    // types then strings, if there are limitations to which types are possible please state them
    expect(memoized("c544d3ae-a72d-4755-8ce5-d25db415b776")).to.equal(5);
  });

  it("should throw an error if no arguments provided", () => {
    const expectedError =
      "Unable to create cache keys without function arguments";
    let returnValue = 5;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction, key => key, 1000);
    expect(() => memoized()).to.throw(expectedError);
  });

  // TODO additional tests required
});

describe("resolver", function() {
  const fakeMemoize = (func, resolver) => {
    return (...arguments) => memoization.keyResolver(resolver, arguments);
  };

  it("should use the first argument if no resolver provided", () => {
    const testFunction = key => returnValue;
    const memoized = fakeMemoize(testFunction);
    expect(memoized(1, 2, 3)).to.equal(1);
  });

  it("should use the revolver if provided", () => {
    const resolver = (a, b, c) => a + b + c;
    const testFunction = key => returnValue;
    const memoized = fakeMemoize(testFunction, resolver);
    expect(memoized(1, 2, 3)).to.equal(6);
  });

  // TODO additional tests required
});
