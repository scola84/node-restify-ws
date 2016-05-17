module.exports = {
  'application/json': {
    encode: JSON.stringify,
    decode: JSON.parse
  },
  'application/octet-stream': {
    encode: (body) => body,
    decode: (body) => body
  },
  'text/plain': {
    encode: (body) => {
      return Buffer.from(body).toString();
    },
    decode: (body) => {
      return Buffer.from(body).toString();
    }
  }
};
