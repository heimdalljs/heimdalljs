import Heimdall from '../heimdall';
import Session from '../session';

import setupSession from '../setup-session';

setupSession(process);

export default new Heimdall(process._heimdall_session_2);
