# Memoization

A general introduction into memoization: https://en.wikipedia.org/wiki/Memoization

See memoization.js and test.js for the required functionality. Please provide a
design rationale documenting your decisions (in code).

## Jaques Notes:

Here follows a brief summary of my process, as well as a few notes

Since I've written some simple memoize functions in the past, I started by just checking out
the provided wikipedia length for good measure as well as going through the problem slowly.
I drew out a some basic points, to try and identify some splittable logical parts.
I also had a look at the `sinon` module, which uses `lolex` under the hood (something i've used before).
Based on the instructions, it would be a `cold` cache memoizer (timeouts don't reset on successive calls). The value would be stored by key in an object, with the key being determined by the resolver.

Once I had a fairly good idea of what my function will look like, what the return-function will behave like and expect, I started in a fairly TDD approach with the resolver.
Once that was behaving as desired, I continuted onto a simple timer-less memoizer, and finally
the full problem with timeout.

I wrote further tests, and made sure the docstring example code passes with my function too.

I also used `istanbul` to test my coverage which followed as :

```
memoization
    ✓ should memoize function result
    ✓ should forget the result after timeout
    ✓ should memoize results for different calls without resolver [numeric keys]
    ✓ should memoize results with array types as keys
    ✓ should memoize results with object types as keys
    ✓ should memoize results with function type as keys
    ✓ should memoize results with boolean types as keys
    ✓ should memoize results with a function that returns a promise
    ✓ should memoize result and recalculate if expired [example test]
    ✓ should throw an error if no arguments provided

  resolver
    ✓ should use the first argument if no resolver provided
    ✓ should use the revolver if provided


  12 passing (21ms)

=============================================================================
Writing coverage object [/home/jaques/NodeProjects/memoization/coverage/coverage.json]
Writing coverage reports at [/home/jaques/NodeProjects/memoization/coverage]
=============================================================================

=============================== Coverage summary ===============================
Statements   : 100% ( 20/20 )
Branches     : 100% ( 12/12 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 19/19 )
================================================================================
```
