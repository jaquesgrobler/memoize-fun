const memoization = require("./memoizaton");
const expect = require("chai").expect;

// I just went with Lolex since I've used it before and it's what `sinon` uses
// under the hood.
const lolex = require("lolex");

describe("memoization", function() {
  // Provided test
  it("should memoize function result", () => {
    let returnValue = 5;
    const testKey = "c544d3ae-a72d-4755-8ce5-d25db415b776";
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction, key => key, 1000);
    expect(memoized(testKey)).to.equal(5);

    returnValue = 10;

    // TODO  it should also work with other types than strings, if there are limitations
    // to which types are possible please state them
    expect(memoized(testKey)).to.equal(5);
  });

  it("should forget the result after timeout", () => {
    let returnValue = 5;
    const testKey = "c544d3ae-a72d-4755-8ce5-d25db415b776";
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction, key => key, 1000);

    let clock = lolex.install();
    setTimeout(() => {
      expect(memoized(testKey)).to.equal(5), 1500;
    });
    clock.uninstall();

    returnValue = 10;
    expect(memoized(testKey)).to.equal(10);
  });

  it("should memoize results for different calls without resolver", () => {
    let returnValue = 5;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction);
    expect(memoized(5)).to.equal(5);

    returnValue = 10;
    expect(memoized(10)).to.equal(10);
    expect(memoized(5)).to.equal(5);
    // Not cached yet, so will execute testFunction and set 7: 10
    expect(memoized(7)).to.equal(10);
    returnValue = 7;
    expect(memoized(7)).to.not.equal(7);
  });

  it("should memoize results with mixed types as keys", () => {
    let returnValue = 5;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction);

    // Array key
    expect(memoized(["cat", "dog"])).to.equal(5);
    returnValue = 10;
    expect(memoized(["cat", "dog"])).to.equal(5);
    expect(memoized(["pig", "dog"])).to.equal(10);
    returnValue = 15;
    expect(memoized(["pig", "dog"])).to.equal(10);

    // Object key
    expect(memoized({ cat: "siamese", dog: "bulldog" })).to.equal(15);
    returnValue = 20;
    expect(memoized({ cat: "siamese", dog: "bulldog" })).to.equal(15);
    expect(memoized({ pig: "peppa", dog: "chow" })).to.equal(20);

    // Function key
    expect(memoized(() => returnValue)).to.equal(20);
    returnValue = 25;
    expect(memoized(() => returnValue)).to.equal(20);
    expect(memoized(() => [returnValue])).to.equal(25);

    // Boolean key
    expect(memoized(true)).to.equal(25);
    returnValue = 30;
    expect(memoized(true)).to.equal(25);
    expect(memoized(false)).to.equal(30);
  });

  it("should memoize result and recalculate if expired [example test]", () => {
    // I added the `valueOf` here, as the original example does a concatination of Date.now()'s
    // numeric value with the Date(y,m,d) string.
    const addToTime = (year, month, day) => {
      return Date.now() + new Date(year, month, day).valueOf();
    };

    //create our memoize funcion, wrapping addToTime, its resolver and a 5s timeout
    const memoized = memoization.memoize(
      addToTime,
      (year, month, day) => year + month + day,
      5000
    );

    // call the provided function, cache the result and return the value
    const result = memoized(1, 11, 26);

    // because there was no timeout this call should return the memorized value from the first call
    const secondResult = memoized(1, 11, 26);
    expect(result).to.equal(secondResult);

    // after 5000 ms the value is not valid anymore and the original function should be called again
    let clock = lolex.install();
    setTimeout(() => {
      expect(memoized(1, 11, 26)).to.not.equal(secondResult);
    }, 6000);
    clock.uninstall();
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
