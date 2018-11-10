import Session from './session';

export default function setupSession(context: any): Session {
  // The name of the property encodes the session/node compatibilty version
  if (context._heimdall_session_3 === undefined) {
    context._heimdall_session_3 = new Session();
  }
  return context._heimdall_session_3;
}
