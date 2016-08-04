import Heimdall from './src/heimdall';
import Session from './src/session';

import sessionSetup from './src/session-setup'

sessionSetup(process);

export default new Heimdall(process._heimdall_session_1);
