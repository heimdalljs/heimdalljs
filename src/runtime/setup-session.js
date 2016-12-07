import Session from './session';
import { warn } from '../shared/log';

export default function setupSession(global) {

  // The name of the property encodes the session/node compatibilty version
  if (!global._heimdall_session_3) {
    global._heimdall_session_3 = new Session();
  } else {
    warn(`Skipped Heimdall Session instantiation as a global session already exists.`);
  }
}
