const stream = require('stream');
const url = require('url');

class ServerRequest extends stream.Readable {
  constructor(socket, data) {
    super();

    const [method, uri] = data[0].split(' ');

    this.socket = socket;
    this.method = method;
    this.url = uri;
    this.headers = data[1];

    this._body = data[2];
    this._url = url.parse(this.url, true);

    this.log = {
      trace: () => {}
    };
  }

  _read() {
    this.push(this._body);
    this._body = null;
  }

  startHandlerTimer() {}

  endHandlerTimer() {}

  href() {
    return this._url.href;
  }

  getHref() {
    return this.href();
  }

  path() {
    return this._url.pathname;
  }

  getPath() {
    return this.path();
  }

  query() {
    return this._url.query;
  }

  getQuery() {
    return this.query();
  }

  contentLength() {
    return Number(this.headers['content-length']);
  }

  getContentLength() {
    return this.contentLength();
  }

  contentType() {
    return (this.headers['content-type'] ||
      'application/octet-stream').toLowerCase();
  }

  getContentType() {
    return this.contentType();
  }

  version() {
    return this.headers['accept-version'] || '*';
  }
}

module.exports = ServerRequest;
