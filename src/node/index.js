import Heimdall from '../heimdall';
import Session from '../session';
import Node from '../node';
import setupSession from '../setup-session';

setupSession(process);

Heimdall.Node = Node;

export default new Heimdall(process._heimdall_session_2);
