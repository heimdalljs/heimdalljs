import Session from './session';
import { warn } from '../shared/log';

export default function setupSession(global) {
  // The name of the property encodes the session/node compatibilty version
  if (!global._heimdall_session_3) {
    global._heimdall_session_3 = new Session();
  }

  for (let i = 1; i < 3; i++) {
    let key = `_heimdall_session_${i}`;
    if (global[key]) {
      warn(`Using HeimdallSession Version 3, but a global session for HeimdallSession version ${i} also exists!.`);
    }
  }
}
