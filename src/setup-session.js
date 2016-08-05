import Session from './session';

export default function setupSession(global) {

  // The name of the property encodes the session/node compatibilty version
  if (!global._heimdall_session_1) {
    global._heimdall_session_1 = new Session();
  }
}
