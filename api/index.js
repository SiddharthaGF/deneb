let app;

export default async (req, res) => {
  try {
    const { createApp } = await import('../dist/create-app.js');
    if (!app) {
      app = await createApp();
      await app.init();
      await app.getHttpAdapter().getInstance().ready();
    }
    app.getHttpAdapter().getInstance().server.emit('request', req, res);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain');
    res.end(
      `NODE=${process.version}\nCWD=${process.cwd()}\nNAME=${err && err.name}\nCODE=${err && err.code}\nMSG=${err && err.message}\nSTACK=${err && err.stack}`,
    );
  }
};
