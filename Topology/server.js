// server.js
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

let clients = {};
let chatHistory = []; // Store last 50 messages

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "register") {
            clients[data.username] = ws;

            // Send chat history to the new user
            ws.send(JSON.stringify({ type: "history", history: chatHistory }));

            // Broadcast updated user list
            broadcast({ type: "updateUsers", users: Object.keys(clients) });
        } else if (data.type === "message") {
            const formattedMessage = { sender: data.sender, content: data.content };
            chatHistory.push(formattedMessage);

            // Limit chat history to the last 50 messages
            if (chatHistory.length > 50) chatHistory.shift();

            broadcast({ type: "chat", message: formattedMessage });
        }
    });

    ws.on("close", () => {
        Object.keys(clients).forEach((username) => {
            if (clients[username] === ws) delete clients[username];
        });
        broadcast({ type: "updateUsers", users: Object.keys(clients) });
    });
});

function broadcast(data) {
    Object.values(clients).forEach((client) => client.send(JSON.stringify(data)));
}

console.log("WebSocket server running on ws://localhost:8080");
