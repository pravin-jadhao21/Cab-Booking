const EventEmitter = require('events');

class SocketEvents extends EventEmitter {}

module.exports = new SocketEvents();
