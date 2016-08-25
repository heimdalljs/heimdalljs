import Heimdall from '../';
import Session from '../session';
import now from '../../shared/time';
import Tree from '../../heimdall-tree';
import Node from '../../heimdall-tree/node';
import setupSession from '../setup-session';

setupSession(process);

Heimdall.now = now;
Heimdall.Session = Session;
Heimdall.Tree = Tree;
Heimdall.Node = Node;

export default new Heimdall(process._heimdall_session_3);
