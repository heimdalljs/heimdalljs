import Heimdall from '../';
import Session from '../session';
import now from '../../shared/time';
import Tree from '../../heimdall-tree';
import Node from '../../heimdall-tree/node';
import setupSession from '../setup-session';

const session = setupSession(process);

// This should be handled by packaging not here
type HeimdallNamespace = Heimdall & {
  now: typeof now;
  Heimdall: typeof Heimdall;
  Session: typeof Session;
  _Tree: typeof Tree;
  _Node: typeof Node;
};

const defaultHeimdall = new Heimdall(session) as HeimdallNamespace;

defaultHeimdall.now = now;
defaultHeimdall.Heimdall = Heimdall;
defaultHeimdall.Session = Session;
defaultHeimdall._Tree = Tree;
defaultHeimdall._Node = Node;

export default defaultHeimdall;
