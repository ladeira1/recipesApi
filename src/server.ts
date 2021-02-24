import app from './app';

// eslint-disable-next-line no-console
const server = app.listen(3333, () => console.log('Listening on port 3333'));

export default server;
