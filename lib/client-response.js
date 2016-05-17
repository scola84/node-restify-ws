const Negotiator = require('negotiator');

class ClientResponse {
  constructor(codec, data) {
    this.req = null;
    this.codec = codec;

    this.statusCode = Number(data[0]);
    this.headers = data[1];
    this._body = data[2];
    this.__body = null;
  }

  get body() {
    if (this.__body) {
      return this.__body;
    }

    const type = this.headers['Content-Type'] ||
      this.headers['content-type'] ||
      this.req && new Negotiator(this.req).mediaType();
    const codec = this.codec[type];

    if (codec) {
      this.__body = codec.decode(this._body);
    }

    return this.__body;
  }
}

module.exports = ClientResponse;
