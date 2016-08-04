var Heimdall = require('./src/heimdall');
var Session = require('./src/session');


// The name of the property encodes the session/node compatibilty version
if (!process._heimdall_session_1) {
  process._heimdall_session_1 = new Session();
}


module.exports = new Heimdall(process._heimdall_session_1);
