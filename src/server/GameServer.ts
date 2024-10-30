import { Server, Socket } from 'socket.io';
import http from 'http';
import { Player, Message } from '../shared/types';

export class GameServer {
    private io: Server;
    private players: Record<string, Player> = {};

    constructor(server: http.Server) {
        this.io = new Server(server, { cors: { origin: 'http://localhost:3000' } });

        this.io.on('connection', (socket) => {
            console.log(`Player connected: ${socket.id}`);

            // Inicializa jogador com propriedades `health` e `mana`
            this.players[socket.id] = {
                id: socket.id,
                exp: 0,
                name: `Player ${socket.id}`,
                health: 100,  // Valor inicial de saúde (vida)
                maxHealth: 100,
                mana: 50,     // Valor inicial de mana
                maxMana: 50
            };
            this.getPlayer(this.players[socket.id])
            this.updatePlayers();

            // Comando do jogador
            socket.on('playerCommand', (command: string) => this.handlePlayerCommand(socket, command));

            // Desconexão
            socket.on('disconnect', () => {
                delete this.players[socket.id];
                this.updatePlayers();
                console.log(`Player disconnected: ${socket.id}`);
            });
        });
    }

    private handlePlayerCommand(socket: Socket, command: string) {
        console.log("Comando recebido do jogador:", command);
        let showCommand = true;
        if (command.startsWith("set name:")) {
            this.setName(socket, command);
            showCommand = false
        }
        if (showCommand) {
            const message: Message = { from: this.players[socket.id].name, content: command };
            this.io.emit('newMessage', message);
        }
    }

    private updatePlayers() {
        const playersArray = Object.values(this.players);
        this.io.emit('updatePlayers', playersArray);
    }

    private getPlayer(player: Player) {
        this.io.emit('playerConnected', player)
    }

    private setName(socket: Socket, command: string) {
        let nameSplited = command.split(":");
        const name = nameSplited[1].trim();
        this.players[socket.id].name = name;
        this.io.to(socket.id).emit('updatedName', name)
        this.updatePlayers();
    }
}
