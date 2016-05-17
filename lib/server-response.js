const Negotiator = require('negotiator');

class ServerResponse {
  constructor(socket, codec, type, request) {
    this.socket = socket;
    this.req = request;
    this.codec = codec;
    this.type = type;

    this.statusCode = 200;
    this.statusMessage = '';

    this._headers = {};
    this._body = [];
  }

  status(code) {
    this.statusCode = code;
  }

  getHeader(name) {
    return this._headers[name] ||
      this._headers[name.toLowerCase()];
  }

  setHeader(name, value) {
    this._headers[name] = value;
  }

  deleteHeader(name) {
    delete this._headers[name];
  }

  json(statusCode, body) {
    this.setHeader('Content-Type', 'application/json');
    this.send(statusCode, body);
  }

  send(statusCode, body) {
    if (typeof statusCode !== 'number') {
      body = statusCode;
      statusCode = this.statusCode;
    }

    this.statusCode = statusCode;
    this._body = body;
    this.end();
  }

  writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    Object.assign(this._headers, headers);
  }

  write(data, encoding) {
    if (!data) {
      return;
    }

    this._body.push(Buffer.from(data, encoding));
  }

  end(data, encoding) {
    this.write(data, encoding);

    if (this.req.headers['x-request-id']) {
      this.setHeader('x-request-id', this.req.headers['x-request-id']);
    }

    const type = this.getHeader('Content-Type') ||
      new Negotiator(this.req).mediaType();
    const codec = this.codec[type];

    let body = this._body;

    if (Array.isArray(body)) {
      body = body.length > 0 ? Buffer.concat(this._body) : null;
    }

    if (codec) {
      body = codec.encode(body);
    }

    this.socket.send(this.codec[this.type].encode([
      this.statusCode,
      this._headers,
      body
    ]));

    this.data = [];
  }

  destroy() {}
}

module.exports = ServerResponse;
