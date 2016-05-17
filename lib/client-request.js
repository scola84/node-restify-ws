const Negotiator = require('negotiator');

class ClientRequest {
  constructor(socket, codec, type, options, callback) {
    this.socket = socket;
    this.codec = codec;
    this.type = type;
    this.callback = callback;

    this.method = options.method || 'GET';
    this.path = options.path || '/';
    this.headers = options.headers || {};
    this._body = [];
  }

  getHeader(name) {
    return this.headers[name] ||
      this.headers[name.toLowerCase()];
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  deleteHeader(name) {
    delete this.headers[name];
  }

  json(body) {
    this.setHeader('Content-Type', 'application/json');
    this.send(body);
  }

  send(body) {
    this._body = body;
    this.end();
  }

  write(data, encoding) {
    if (!data) {
      return;
    }

    this._body.push(Buffer.from(data, encoding));
  }

  end(data, encoding) {
    this.write(data, encoding);

    const type = this.getHeader('Content-Type') ||
      new Negotiator(this).mediaType();
    const codec = this.codec[type];

    let body = this._body;

    if (Array.isArray(body)) {
      body = body.length > 0 ? Buffer.concat(this._body) : null;
    }

    if (codec) {
      body = codec.encode(body);
    }

    this.socket.send(this.codec[this.type].encode([
      this.method + ' ' + this.path,
      this.headers,
      body
    ]));

    this.data = [];
  }
}

module.exports = ClientRequest;
