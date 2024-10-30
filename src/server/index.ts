import http from 'http';
import { GameServer } from './GameServer';

const server = http.createServer();
const gameServer = new GameServer(server);

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
