const { createApp } = require('../dist/create-app');

let app;

module.exports = async (req, res) => {
  if (!app) {
    app = await createApp();
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  }

  app.getHttpAdapter().getInstance().server.emit('request', req, res);
};
