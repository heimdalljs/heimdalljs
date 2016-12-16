import Session from './session';
import { warn } from '../shared/log';

const CURRENT_VERSION = 3;
const SESSION_KEY_PREFIX = '_heimdall_session_';
const CURRENT_SESSION_KEY = `${SESSION_KEY_PREFIX}${CURRENT_VERSION}`;

export default function setupSession(global) {
  // The name of the property encodes the session/node compatibilty version
  if (!global[CURRENT_SESSION_KEY]) {
    global[CURRENT_SESSION_KEY] = new Session();
  }

  for (let i = 1; i < CURRENT_VERSION; i++) {
    let key = `${SESSION_KEY_PREFIX}${i}`;
    if (global[key]) {
      warn(`Using HeimdallSession Version ${CURRENT_VERSION}, but a global session for HeimdallSession version ${i} also exists!.`);
    }
  }
}
