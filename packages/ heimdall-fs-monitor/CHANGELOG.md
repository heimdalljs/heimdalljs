## 1.1.1

#### :bug: Bug Fixes
* [#153](https://github.com/heimdalljs/heimdalljs/pull/153) Monitor realpath.native ([@hjdivad](https://github.com/hjdivad))

Previously when monitoring `realpath` and `realpathSync` would be replaced by functions that lacked the corresponding `.native` property. `realpath.native` and `realpathSync.native` are now included when monitoring and are themselves monitored.

## 1.1.0

- add opt-in ability to get file location trigger fs operations via `process.env.HEIMDALL_FS_MONITOR_CALL_TRACING = 1; `

## 1.0.0

- remove node@6 support
- adds invocation data behind a flag to know where fs calls are coming from
