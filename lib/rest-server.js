const pathToRegexp = require('path-to-regexp');
const RestHandler = require('./rest-handler');

class RestServer {
  constructor() {
    this.layers = [];
  }

  use(middleware) {
    this.add({
      middleware
    });
  }

  get(path, callback) {
    this.route('GET', path, callback);
  }

  post(path, callback) {
    this.route('POST', path, callback);
  }

  put(path, callback) {
    this.route('PUT', path, callback);
  }

  delete(path, callback) {
    this.route('DELETE', path, callback);
  }

  route(method, path, callback) {
    const keys = [];

    this.add({
      method,
      path,
      callback,
      keys,
      regexp: pathToRegexp(path, keys)
    });
  }

  add(layer) {
    this.layers.push(layer);
  }

  _handle(request, response) {
    const handler = new RestHandler(this.layers.slice(), request, response);
    handler.handle();
  }
}

module.exports = RestServer;
