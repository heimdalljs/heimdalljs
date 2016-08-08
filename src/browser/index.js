import Heimdall from '../heimdall';
import Session from '../session';

import setupSession from '../setup-session';

setupSession(window);

export default new Heimdall(window._heimdall_session_1);
