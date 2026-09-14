import { createApp } from '../dist/create-app.js';

let app;

export default async (req, res) => {
  if (!app) {
    app = await createApp();
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  }

  app.getHttpAdapter().getInstance().server.emit('request', req, res);
};
