/*
  Environment setup has it's own module because otherwise our other tests run
  prior to setting up the process thanks to import statement hoisting.
 */
export const FREE_GLOBAL = typeof window !== 'undefined' ? window : global;
export const IS_TESTING = true;
declare global {
  interface Window {
    IS_HEIMDALL_TEST_ENVIRONMENT: boolean;
  }
  namespace NodeJS {
    interface Global {
      IS_HEIMDALL_TEST_ENVIRONMENT: boolean;
    }
  }
}

FREE_GLOBAL.IS_HEIMDALL_TEST_ENVIRONMENT = IS_TESTING;

export default {
  FREE_GLOBAL,
  IS_TESTING
};
