import HeimdallCtor from '../';
import SessionCtor from '../session';
import TreeCtor from '../../heimdall-tree';

import setupSession from '../setup-session';

const session = setupSession(self);

// browser equivalent of heimdall.js

type HeimdallGlobal = typeof HeimdallCtor & {
  Session: typeof SessionCtor;
  Tree: typeof TreeCtor;
};

declare global {
  let Heimdall: HeimdallGlobal;
}

// tslint:disable-next-line:prefer-object-spread
Heimdall = HeimdallCtor as HeimdallGlobal;
Heimdall.Session = SessionCtor;
Heimdall.Tree = TreeCtor;

export default new HeimdallCtor(session);
