const ClientRequest = require('./client-request');
const ClientResponse = require('./client-response');
const ServerRequest = require('./server-request');
const ServerResponse = require('./server-response');
const codecs = require('./codecs');

class Connection {
  constructor(restServer, socket, options, connector) {
    options = options || {};

    this.server = restServer;
    this.socket = socket;
    this.connector = connector;

    this.id = 0;
    this.codecs = Object.assign({}, codecs, options.codecs);
    this.type = options.type || 'application/json';
    this.codecs['*/*'] = this.codecs[options.default || 'application/json'];

    this.requests = {};

    this.socket.on('close', this.handleClose.bind(this));
    this.socket.on('message', this.handleMessage.bind(this));
  }

  handleClose() {
    if (this.connector) {
      this.connector.delete(this);
    }
  }

  handleMessage(data) {
    data = data.data ? data.data : data;
    data = this.codecs[this.type].decode(data);

    if (typeof data[0] === 'number') {
      const response = new ClientResponse(this.codecs, data);

      if (response.headers['x-request-id']) {
        const id = Number(response.headers['x-request-id']);

        if (this.requests[id]) {
          response.req = this.requests[id];
          response.req.callback(response);
          delete this.requests[id];
        }
      }
    } else {
      const request = new ServerRequest(this.socket, data);
      const response = new ServerResponse(this.socket, this.codecs,
        this.type, request);

      this.server._handle(request, response);
    }
  }

  request(options, callback) {
    const request = new ClientRequest(this.socket, this.codecs,
      this.type, options, callback);

    if (callback) {
      request.setHeader('x-request-id', ++this.id);
      this.requests[this.id] = request;
    }

    return request;
  }
}

module.exports = Connection;
