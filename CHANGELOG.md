# master

# 0.3.3

* add runtime version information
* replace `EmptyObject` with `Object.create(null)`
* don't include tests in published package

# 0.3.2

* add session-root and page-root to tree construction

# 0.3.1

* don't depend on Uint32Array
* add hasMonitor

# 0.3.0

* DO NOT USE THIS VERSION
* alpha release to work around npm install bugs causing problems downstream with
  our actual alpha tag 0.3.0-alpha3

# 0.2.1

* Move `window` -> `self`

# 0.2.0

* Add `HeimdallNode.forEachChild`

# 0.1.6

* Fix regression: re-expose `Heimdall` via heimdalljs/heimdall.

# 0.1.5

* Fix `isRoot` regression

# 0.1.4

* Add browser support
* Use gentler version checking; switch to using a shared session instead of a
  shared `Heimdall` instance

# 0.1.3

* Add `HeimdallNode.remove` so users with long-lived apps can plug leaks

# 0.1.2

* minor fixes

# 0.1.1

* minor fixes

# 0.1.0

* initial version
