module.exports = (logger) => {
  return (error, request, response, next) => {
    const match = error.message.match(/(\d{3})\s([^\:]*)((\:\s)?(.*))/);
    const body = {
      status: 500,
      message: 'Internal server error'
    };

    if (match) {
      body.status = Number(match[1]);

      if (body.status !== 500) {
        body.message = match[2];
      }

      if (match[5] && body.status >= 400 && body.status < 500) {
        body.reason = match[5];
      }
    }

    response.status(body.status);
    response.json(body);
    response.end();
    response.destroy();

    if (logger) {
      logger.error(request.connection.remoteAddress +
        ' - - ' + error.message);
    }
  };
};
