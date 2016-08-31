import Heimdall from '../heimdall';
import Session from '../session';
import now from '../time';
import Node from '../node';
import setupSession from '../setup-session';

setupSession(process);

Heimdall.Node = Node;
Heimdall.now = now;

export default new Heimdall(process._heimdall_session_2);
