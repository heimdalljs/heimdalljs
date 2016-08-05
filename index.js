import Heimdall from './src/heimdall';
import Session from './src/session';

import setupSession from './src/setup-session';

setupSession(process);

export default new Heimdall(process._heimdall_session_1);
