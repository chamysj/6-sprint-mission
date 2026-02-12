import { createServer } from 'http';
import app from './app';
import { PORT } from './lib/constants';
import { initSocket } from './socket';

const server = createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
