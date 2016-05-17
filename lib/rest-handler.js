class RestHandler {
  constructor(layers, request, response) {
    this.layers = layers;
    this.request = request;
    this.response = response;
    this.matched = false;
  }

  handle() {
    if (this.layers.length === 0) {
      if (!this.matched) {
        this.response.send(404, 'Cannot ' +
          this.request.method + ' ' + this.request.path());
      }

      return;
    }

    const layer = this.layers.splice(0, 1).pop();

    if (layer.middleware) {
      if (layer.middleware.length !== 4) {
        layer.middleware(this.request, this.response,
          this.handleNext.bind(this));
      } else {
        this.handleNext();
      }
    } else if (layer.method) {
      if (layer.method === this.request.method) {
        const match = layer.regexp.exec(this.request.path());

        if (match) {
          this.matched = true;
          this.request.params = this.createParams(layer.keys, match);

          layer.callback(this.request, this.response,
            this.handleNext.bind(this));
        } else {
          this.handleNext();
        }
      } else {
        this.handleNext();
      }
    }
  }

  handleNext(error) {
    if (error) {
      let i = 0;

      for (; i < this.layers.length; i += 1) {
        if (this.layers[i].middleware &&
          this.layers[i].middleware.length === 4) {
          break;
        }
      }

      if (i !== this.layers.length) {
        const layer = this.layers.splice(i, 1).pop();

        layer.middleware(error, this.request, this.response,
          this.handleNext.bind(this));
      }

      return;
    }

    this.handle();
  }

  createParams(keys, match) {
    const params = {};

    keys.forEach((key, index) => {
      params[key.name] = match[index + 1];
    });

    return params;
  }
}

module.exports = RestHandler;
