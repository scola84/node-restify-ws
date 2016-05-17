const Connection = require('./connection');

class Connector {
  constructor(restServer, wsServer, options) {
    this.restServer = restServer;
    this.wsServer = wsServer;
    this.options = options;

    this.connections = new Set();
    this.wsServer.on('connection', this.connect.bind(this));
  }

  connect(socket) {
    this.connections.add(new Connection(this.restServer, socket,
      this.options, this));
  }

  delete(connection) {
    this.connections.delete(connection);
  }

  close() {
    this.wsServer.close();
  }
}

module.exports = Connector;
