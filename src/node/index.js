import Heimdall from '../heimdall';
import Session from '../session';
import Node from '../node';
import Cookie from '../cookie';
import setupSession from '../setup-session';

setupSession(process);

Heimdall.Cookie = Cookie;
Heimdall.Node = Node;

export default new Heimdall(process._heimdall_session_2);
