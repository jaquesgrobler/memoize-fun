const memoization = require("../src/memoizaton");
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

    expect(memoized(testKey)).to.equal(5);
  });

  // Test our timeout functinality
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

  it("should memoize results for different calls without resolver [numeric keys]", () => {
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

  // Works, but the resolver would be used for better keys here, as long arrays will create giant keys
  it("should memoize results with array types as keys", () => {
    let returnValue = 5;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction);

    expect(memoized(["cat", "dog"])).to.equal(5);
    returnValue = 10;
    expect(memoized(["cat", "dog"])).to.equal(5);
    expect(memoized(["pig", "dog"])).to.equal(10);
    returnValue = 15;
    expect(memoized(["pig", "dog"])).to.equal(10);
  });

  // I added a JSON.stringify to my resolver to allow this to work, as just using objects as key will result in them overwriting
  // eachother, since they'll all just be `[Object object]`. Here one would rather use a resolver to map some attributes
  // to a key
  it("should memoize results with object types as keys", () => {
    let returnValue = 15;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction);

    expect(memoized({ cat: "siamese", dog: "bulldog" })).to.equal(15);
    returnValue = 20;
    expect(memoized({ cat: "siamese", dog: "bulldog" })).to.equal(15);
    expect(memoized({ pig: "peppa", dog: "chow" })).to.equal(20);
  });

  // This works, as a functions toString will be used as key, however a resolver should
  // rather be used to set a more sane key.
  it("should memoize results with function type as keys", () => {
    let returnValue = 20;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction);

    expect(memoized(() => returnValue)).to.equal(20);
    returnValue = 25;
    expect(memoized(() => returnValue)).to.equal(20);
    expect(memoized(() => [returnValue])).to.equal(25);
  });

  // Works for boolean types, though all true's will overwrite eachother obviously, as there are
  // only two options here. Resolver would be used for a better key if the first argument is boolean.
  it("should memoize results with boolean types as keys", () => {
    let returnValue = 25;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction);

    expect(memoized(true)).to.equal(25);
    returnValue = 30;
    expect(memoized(true)).to.equal(25);
    expect(memoized(false)).to.equal(30);
  });

  it("should memoize results with a function that returns a promise", done => {
    let returnValue = 30;
    const testFunction = key => returnValue;
    const memoized = memoization.memoize(testFunction);

    const fakePromiseCall = () => {
      return Promise.resolve().then(() => returnValue);
    };

    const memoizedPromiseCall = memoization.memoize(
      fakePromiseCall,
      key => key,
      1000
    );
    memoizedPromiseCall(10).then(result => {
      expect(result).to.equal(returnValue);
      done();
    });

    expect(memoized(Promise.resolve(1))).to.equal(30);

    // Promises as values must have resolvers - so passing a Promise as the first argument and trying to use it a key
    // would not work well. a resolver would better address this situation.
  });

  it("should memoize result and recalculate if expired [example test]", () => {
    // I added the `valueOf` here, as the original example does a concatination of Date.now()'s
    // numeric value with the Date(y,m,d) string.
    const addToTime = (year, month, day) => {
      return Date.now() + new Date(year, month, day).valueOf();
    };

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
