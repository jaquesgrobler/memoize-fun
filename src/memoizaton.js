/**
 * Creates a function that memoizes the result of func. If resolver is provided,
 * it determines the cache key for storing the result based on the arguments provided to the memorized function.
 * By default, the first argument provided to the memorized function is used as the map cache key. The memorized values
 * timeout after the timeout exceeds. The timeout is in defined in milliseconds.
 *
 * Example:
 * function addToTime(year, month, day) {
 *  return Date.now() + Date(year, month, day);
 * }
 *
 * const memoized = memoization.memoize(addToTime, (year, month, day) => year + month + day, 5000)
 *
 * // call the provided function, cache the result and return the value
 * const result = memoized(1, 11, 26); // result = 1534252012350
 *
 * // because there was no timeout this call should return the memorized value from the first call
 * const secondResult = memoized(1, 11, 26); // secondResult = 1534252012350
 *
 * // after 5000 ms the value is not valid anymore and the original function should be called again
 * const thirdResult = memoized(1, 11, 26); // thirdResult = 1534252159271
 *
 * @param func      the function for which the return values should be cached
 * @param resolver  if provided gets called for each function call with the exact same set of parameters as the
 *                  original function, the resolver function should provide the memoization key.
 * @param timeout   timeout for cached values in milliseconds
 */

function memoize(func, resolver, timeout) {
  // Our key-value cache - This could also be placed in the moodule scope since `require` will create a singleton
  // however its more functionally pure having it here
  const memoCache = {};

  return (...arguments) => {
    try {
      // First we need our key
      const cacheKey = keyResolver(resolver, arguments);

      // If we havent seen this key, calculate its value and store it
      if (!memoCache[cacheKey]) {
        memoCache[cacheKey] = func(...arguments);

        // Now we add timing - clear the value after the timeout
        if (timeout) {
          setTimeout(() => delete memoCache[cacheKey], timeout);
        }
      }
      return memoCache[cacheKey];
    } catch (error) {
      throw new Error(error.message);
    }
  };
}

const keyResolver = (resolver, args) => {
  let firstArg = args[0];
  if (args.length == 0) {
    throw new Error("Unable to create cache keys without function arguments");
  }

  // Stringify object key if no resolver - as objects will all have the same '[Object object]' key
  // if no resolver is provided to map them to, say, objectId's or something sane.
  if (!resolver && typeof firstArg === "object") {
    firstArg = JSON.stringify(firstArg);
  }

  return resolver ? resolver(...args) : firstArg;
};

module.exports = {
  memoize,
  keyResolver
};
