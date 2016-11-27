# Heimdall

[![Build Status](https://travis-ci.org/heimdalljs/heimdalljs-lib.svg?branch=master)](https://travis-ci.org/heimdalljs/heimdalljs-lib)

A blazingly fast performance stat monitoring and collection library for
node or the browser.

## Installation

```cli
npm install heimdalljs
```

## How fast?

Heimdall allows for 2 forms of stat collection: counter based and time
based.

The overhead of time based stat collection is the cost of allocating a
 tiny `TypedArray`, a four element `Array`, and `performance.now()`. On
Desktop Chrome on a 2015 era MacBook Pro this amounts to roughly 200
nano seconds. You can easily run the benchmarks on devices you care about
 to see what the cost will be for you.

The overhead of counter based collection is the cost of a method call
 with two bitwise operations and an integer increment.  An occasional
 Uint32Array allocation is thrown in when more space is needed. The cost
 here is pragmatically negligible, and counters are ideal for situations
 in which the overhead of a timer is enough to significantly alter stats.

## Usage

**instantiate**
```js
const heimdall = new Heimdall();
```

### Timing
**start timing something**
```js
const token = heimdall.start('<label>');
```

**stop timing something**
```js
heimdall.stop(token);
```

### Monitors

**querying**
```js
let condition = heimdall.hasMonitor('<name>');
```

**register**
```js
let tokens = heimdall.registerMonitor('<name>', ...labels);
```

Example:
```js
let [a, b, c] = heimdall.registerMonitor('<name>', 'foo', 'bar', 'baz');
```

**using**
```js
heimdall.increment(a);
```

### Annotations

```js
heimdall.annotate(<annotation>);
```

### Other

**configFor**
**toJSON**

For the documentation for `HeimdallTree` see []().

## Removing Heimdall from production builds.

If desired, heimdall can be stripped from production builds using
[this plugin](https://github.com/heimdalljs/babel5-plugin-strip-heimdall) for Babel5 or [this plugin]() for Babel6.

## Global Session

Heimdall tracks a graph of timing and domain-specific stats for performance.
Stat collection and monitoring is separated from graph construction to provide
control over context detail.  Users can create fewer nodes to have reduced
performance overhead, or create more nodes to provide more detail.

The graph obviously needs to be global.  This is not a problem in the browser,
but in node we may have multiple different versions of heimdalljs loaded at
once.  Each one will have its own `Heimdall` instance, but will use the same
session, saved on `process`.  This means that the session will have a
heterogeneous graph of `HeimdallNode`s.  For this reason, versions of heimdalljs
that change `Session`, or the APIs of `HeimdallNode` or `Cookie` will use a
different property to store their session (`process._heimdall_session_<n>`).  It
is quite easy for this to result in lost detail & lost stats, although it is
also easy to detect this situation and issue a warning.
