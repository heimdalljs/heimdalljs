import Heimdall from '../';
import Session from '../session';
import now from '../../shared/time';
import Tree from '../../heimdall-tree';
import Node from '../../heimdall-tree/node';
import setupSession from '../setup-session';

setupSession(process);

const defaultHeimdall = new Heimdall(process._heimdall_session_3);

defaultHeimdall.now = now;
defaultHeimdall.Heimdall = Heimdall;
defaultHeimdall.Session = Session;
defaultHeimdall._Tree = Tree;
defaultHeimdall._Node = Node;

export default defaultHeimdall;
