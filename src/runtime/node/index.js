import Heimdall from '../';
import Session from '../session';
import now from '../../shared/time';
import setupSession from '../setup-session';

setupSession(process);

Heimdall.now = now;
Heimdall.Session = Session;

export default new Heimdall(process._heimdall_session_3);
