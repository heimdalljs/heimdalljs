export const FREE_GLOBAL = typeof window !== 'undefined' ? window : global;

FREE_GLOBAL.IS_HEIMDALL_TEST_ENVIRONMENT = true;

// import './shared-tests';
import './runtime-tests';
import './heimdall-tree-tests';