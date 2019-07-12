const memoization = require("./memoizaton");
const expect = require("chai").expect;

// I just went with Lolex since I've used it before and it's what `sinon` uses
// under the hood.
const lolex = require("lolex");

describe("memoization", function() {
  it("should memoize function result", () => {
    let returnValue = 5;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction, key => key, 1000);
    expect(memoized("c544d3ae-a72d-4755-8ce5-d25db415b776")).to.equal(5);

    returnValue = 10;

    // TODO  it should also work with other types than strings, if there are limitations
    // to which types are possible please state them
    expect(memoized("c544d3ae-a72d-4755-8ce5-d25db415b776")).to.equal(5);
  });

  it("should forget the result after timeout", () => {
    let returnValue = 5;
    const key = "c544d3ae-a72d-4755-8ce5-d25db415b776";
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction, key => key, 1000);

    let clock = lolex.install();
    setTimeout(() => {
      expect(memoized(key)).to.equal(5), 1500;
    });
    clock.uninstall();

    returnValue = 10;
    expect(memoized(key)).to.equal(10);
  });

  it("should throw an error if no arguments provided", () => {
    const expectedError =
      "Unable to create cache keys without function arguments";
    let returnValue = 5;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction, key => key, 1000);
    expect(() => memoized()).to.throw(expectedError);
  });
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
});
