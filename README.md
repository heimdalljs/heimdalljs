# Heimdall

[![Build Status](https://travis-ci.org/heimdalljs/heimdalljs-lib.svg?branch=master)](https://travis-ci.org/heimdalljs/heimdalljs-lib)

A blazingly fast performance stat monitoring and collection library for
node or the browser.

## How fast?

Heimdall allows for 2 forms of stat collection: counter based and time
based.

The overhead of time based stat collection is the cost of allocating a
 tiny `TypedArray`, a four element `Array`, and `performance.now()`. On
Desktop Chrome on a 2015 era MacBook Pro this amounts to roughly 200
nanoseconds. You can easily run the benchmarks on devices you care about
 to see what the cost will be for you.

The overhead of counter based collection is the cost of a method call
 with two bitwise operations and an integer increment.  An occasional
 Uint32Array allocation is thrown in when more space is needed. The cost
 here is pragmatically negligible, and counters are ideal for situations
 in which the overhead of a timer is enough to significantly alter stats.


## Getting started

Checkout [heimdalljs](packages/heimdalljs) for more info on getting started and installed.

### How is the repo structured?

The Heimdall repo is managed as a monorepo that is composed of many [npm packages](packages).