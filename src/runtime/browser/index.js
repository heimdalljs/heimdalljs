import Heimdall from '../';
import Session from '../session';
import Node from '../../heimdall-tree/node';

import setupSession from '../setup-session';

setupSession(self);

// browser equivalent of heimdall.js
self.Heimdall = Heimdall;
Heimdall.Node = Node;

export default new Heimdall(self._heimdall_session_2);
