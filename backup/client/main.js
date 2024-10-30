const socket = io();

document.getElementById('command-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendCommand();
});

function sendCommand() {
    const input = document.getElementById('command-input');
    const command = input.value.trim();
    if (command) {
        socket.emit('playerCommand', command);
        input.value = '';
    }
}

socket.on('newMessage', (message) => {
    const messageArea = document.getElementById('message-area');
    messageArea.innerHTML += `<p><strong>${message.from}:</strong> ${message.content}</p>`;
    messageArea.scrollTop = messageArea.scrollHeight;
});

socket.on('updatePlayers', (players) => {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = players.map((player) => `<li>${player.name}</li>`).join('');
});
