// ======================
// Elements
// ======================
const roomIdInput = document.getElementById("room_id_input");
const joinButton = document.getElementById("join-btn");
const roomIdContainer = document.querySelector(".room_id_container");
const mainContainer = document.querySelector(".main_container");
const nameInput = document.getElementById("name_input");
const messageInput = document.getElementById("message_input");
const sendBtn = document.getElementById("send_btn");
const chatMessages = document.getElementById("chat_messages");
const roomIdDisplay = document.getElementById("room_id");

// ======================
// State
// ======================
let userName = "";
let isJoined = false;
let Room_data = {};

// ======================
// Socket.IO Connection
// ======================
const socket = io("https://room-chat-gpxz.onrender.com", {
    transports: ["websocket"], // force WebSocket
    reconnection: true
});

// ======================
// Join Room
// ======================
joinButton.onclick = () => {
    const roomId = roomIdInput.value.trim();
    const name = nameInput.value.trim();
    userName = name;

    if (!roomId || !name) {
        alert("Room ID and Name cannot be empty!");
        return;
    }

    fetch("https://room-chat-gpxz.onrender.com/api/room_id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId })
    })
    .then(res => res.json())
    .then(data => {
        isJoined = true;
        Room_data = data.Room;
        roomIdDisplay.textContent = `Room ID: ${Room_data.room_id}`;
        toggleUI();
        socket.emit("join_room", { room_id: Room_data.room_id, user: userName });
    })
    .catch(err => console.error("Failed to join room:", err));
};

// ======================
// Toggle UI
// ======================
function toggleUI() {
    if (isJoined) {
        roomIdContainer.style.display = "none";
        mainContainer.style.display = "flex";
        loadOldChats();
    } else {
        roomIdContainer.style.display = "flex";
        mainContainer.style.display = "none";
        Room_data = {};
    }
}

// Initial check
toggleUI();

// ======================
// Send Message
// ======================
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const msg = messageInput.value.trim();
    if (!msg) return;

    socket.emit("send_message", { room_id: Room_data.room_id, user: userName, message: msg });
    messageInput.value = "";
}

// ======================
// Receive Messages
// ======================
socket.on("receive_message", data => {
    addMessage(data.user, data.message);
});

// ======================
// Load Old Chats
// ======================
function loadOldChats() {
    if (!Room_data.chats) return;
    Room_data.chats.forEach(chat => addMessage(chat.user, chat.message));
}

// ======================
// Add Message Helper
// ======================
function addMessage(user, message) {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = `${user}: ${message}`;
    msgDiv.classList.add("message");

    if (user === userName) {
        msgDiv.classList.add("self");
    } else {
        msgDiv.classList.add("other");
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

