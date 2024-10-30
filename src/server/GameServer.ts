import { Server, Socket } from "socket.io";
import http from "http";
import { Player, Message } from "../shared/types";

export class GameServer {
    private io: Server;
    private players: Record<string, Player> = {};

    constructor(server: http.Server) {
        this.io = new Server(server, { cors: { origin: "http://localhost:3000" } });

        this.io.on("connection", (socket) => {
            const playerId = socket.handshake.query.playerId as string;

            if (playerId && this.players[playerId]) {
                // Reassocia o jogador existente ao novo socket.id
                this.players[socket.id] = this.players[playerId];
                delete this.players[playerId];
            } else {
                // Cria um novo jogador se `playerId` não estiver armazenado
                this.players[socket.id] = {
                    id: socket.id,
                    exp: 0,
                    name: `Player ${socket.id}`,
                    health: 100,
                    maxHealth: 100,
                    mana: 50,
                    maxMana: 50,
                };
            }

            this.getPlayer(this.players[socket.id]);
            this.updatePlayers();

            socket.on("playerCommand", (command: string) =>
                this.handlePlayerCommand(socket, command)
            );

            socket.on("disconnect", () => {
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
            showCommand = false;
        }
        if (showCommand) {
            const message: Message = {
                from: this.players[socket.id].name,
                content: command,
            };
            this.io.emit("newMessage", message);
        }
    }

    private updatePlayers() {
        const playersArray = Object.values(this.players);
        this.io.emit("updatePlayers", playersArray);
    }

    private getPlayer(player: Player) {
        this.io.emit("playerConnected", player);
    }

    private setName(socket: Socket, command: string) {
        const name = command.split(":")[1].trim();
        this.players[socket.id].name = name;
        this.io.to(socket.id).emit("updatedName", name);
        this.updatePlayers();
    }
}
