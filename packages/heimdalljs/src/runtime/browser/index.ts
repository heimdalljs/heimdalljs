import Heimdall from '../';
import Session from '../session';
import Tree from '../../heimdall-tree';

import setupSession from '../setup-session';

setupSession(self);

// browser equivalent of heimdall.js
self.Heimdall = Heimdall;
Heimdall.Session = Session;
Heimdall.Tree = Tree;

export default new Heimdall(self._heimdall_session_3);
