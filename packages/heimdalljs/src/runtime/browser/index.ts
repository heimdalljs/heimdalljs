import Heimdall from '../';
import Session from '../session';
import Tree from '../../heimdall-tree';

import setupSession from '../setup-session';

setupSession(self);

declare global {
  interface Window {
    Heimdall: typeof Heimdall;
  }
}

// browser equivalent of heimdall.js
self.Heimdall = Heimdall;
Heimdall.Session = Session;
Heimdall.Tree = Tree;

export default new Heimdall((self as any)._heimdall_session_3);
