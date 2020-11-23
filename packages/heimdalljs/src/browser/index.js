import Heimdall from '../heimdall';
import Session from '../session';

import setupSession from '../setup-session';

setupSession(self);

// browser equivalent of heimdall.js
self.Heimdall = Heimdall;

export default new Heimdall(self._heimdall_session_2);
