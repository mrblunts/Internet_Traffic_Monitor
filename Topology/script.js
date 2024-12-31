const ws = new WebSocket("ws://localhost:8080");
const messagesDiv = document.getElementById("messages");
const userList = document.getElementById("users");
const messageInput = document.getElementById("messageInput");
const sendMessageButton = document.getElementById("sendMessage");
const emojiPickerDiv = document.getElementById("emoji-picker");

let username;

// Emoji List
const emojis = ["😀", "😂", "😍", "😢", "😡", "👍", "🙏", "🎉"];

// Initialize emoji picker
emojis.forEach((emoji) => {
    const emojiBtn = document.createElement("button");
    emojiBtn.textContent = emoji;
    emojiBtn.addEventListener("click", () => {
        messageInput.value += emoji;
        emojiPickerDiv.style.display = "none";
    });
    emojiPickerDiv.appendChild(emojiBtn);
});

messageInput.addEventListener("focus", () => {
    emojiPickerDiv.style.display = "flex";
});

// Function to register user
function registerUser() {
    username = prompt("Enter your username:");
    if (username) {
        ws.send(JSON.stringify({ type: "register", username }));
    } else {
        alert("Username is required!");
        registerUser();
    }
}

ws.onopen = () => {
    registerUser();
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "chat") {
        const message = document.createElement("div");
        message.textContent = `${data.message.sender}: ${data.message.content}`;
        messagesDiv.appendChild(message);
    } else if (data.type === "history") {
        data.history.forEach((msg) => {
            const message = document.createElement("div");
            message.textContent = `${msg.sender}: ${msg.content}`;
            messagesDiv.appendChild(message);
        });
    } else if (data.type === "updateUsers") {
        userList.innerHTML = "";
        data.users.forEach((user) => {
            const li = document.createElement("li");
            li.textContent = user;
            userList.appendChild(li);
        });
    }
};

sendMessageButton.addEventListener("click", () => {
    const content = messageInput.value.trim();
    if (content) {
        ws.send(JSON.stringify({ type: "message", sender: username, content }));
        messageInput.value = "";
    }
});
