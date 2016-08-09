import Heimdall from '../heimdall';
import Session from '../session';

import setupSession from '../setup-session';

setupSession(window);

// browser equivalent of heimdall.js
self.Heimdall = Heimdall;

export default new Heimdall(window._heimdall_session_1);
