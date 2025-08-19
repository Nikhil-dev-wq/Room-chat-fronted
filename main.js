import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.1/socket.io.esm.min.js";
const socket = io("https://chat-backend-mmf7.onrender.com");

// ---------------- DOM ELEMENTS ----------------
const roomIdInput = document.getElementById("room-id-input");
const nameInput = document.getElementById("name-input");
const joinBtn = document.getElementById("join-btn");
const errorMessage = document.getElementById("error-message");
const joinContainer = document.querySelector(".join-container");
const chatContainer = document.querySelector(".chat-room-container");
const messagesList = document.getElementById("messages");
const roomNameDisplay = document.getElementById("room-name");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const leaveBtn = document.getElementById("leave-btn");

// ---------------- LOCAL STORAGE ----------------
let savedRoomId = localStorage.getItem("roomId");
let savedUsername = localStorage.getItem("name");

if (savedRoomId && savedUsername) {
    roomNameDisplay.innerText = `Room: ${savedRoomId}`;
}

// ---------------- JOIN ROOM ----------------
joinBtn.addEventListener("click", () => {
    const roomId = roomIdInput.value.trim();
    const username = nameInput.value.trim();

    if (!roomId) {
        errorMessage.innerText = "Enter Room ID!";
        return;
    }
    if (!username) {
        errorMessage.innerText = "Enter Name!";
        return;
    }

    // Clear inputs
    roomIdInput.value = "";
    nameInput.value = "";

    socket.emit("joinRoom", roomId, username);
});

// User joins room notification
socket.on("userJoin", (username) => {
    const li = document.createElement("li");
    li.classList.add("info-message");
    li.innerText = `${username} has joined the room!`;
    messagesList.appendChild(li);
});

// Confirmation of joining room
socket.on("joinedRoom", (roomId, username) => {
    localStorage.setItem("joined", "true");
    localStorage.setItem("name", username);
    localStorage.setItem("roomId", roomId);

    const li = document.createElement("li");
    li.classList.add("info-message");
    li.innerText = `You joined the room!`;
    messagesList.appendChild(li);

    updateContainerDisplay();
});

// ---------------- UPDATE UI ----------------
function updateContainerDisplay() {
    if (localStorage.getItem("joined") === "true") {
        joinContainer.style.display = "none";
        chatContainer.style.display = "flex";
        roomNameDisplay.innerText = `Room: ${localStorage.getItem("roomId")}`;
    } else {
        joinContainer.style.display = "flex";
        chatContainer.style.display = "none";
    }
}

updateContainerDisplay();

// ---------------- SEND MESSAGE ----------------
sendBtn.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (!message) return;

    const username = localStorage.getItem("name");
    const roomId = localStorage.getItem("roomId");

    socket.emit("messages", username, message, roomId);

    const li = document.createElement("li");
    li.classList.add("message", "me");
    li.innerText = `You: ${message}`;
    messagesList.appendChild(li);

    messageInput.value = "";
});

const typingIndicator = document.getElementById("typing");

// Show typing indicator when someone is typing
socket.on("typing", (username) => {
    typingIndicator.style.display = "inline-block";
    typingIndicator.innerText = `${username} is typing`;
    
    // Hide after 2 seconds if no further typing event
    clearTimeout(typingIndicator.timeout);
    typingIndicator.timeout = setTimeout(() => {
        typingIndicator.style.display = "none";
    }, 1000);
});

// Emit typing event when user types
messageInput.addEventListener("input", () => {
    const username = localStorage.getItem("name");
    const roomId = localStorage.getItem("roomId");
    socket.emit("typing", username, roomId);
});


// Receive messages
socket.on("messages", (username, message) => {
    const li = document.createElement("li");
    li.classList.add("message");
    li.innerText = `${username}: ${message}`;
    messagesList.appendChild(li);
});

// ---------------- LEAVE ROOM ----------------
leaveBtn.addEventListener("click", () => {
    const username = localStorage.getItem("name");
    const roomId = localStorage.getItem("roomId");
    socket.emit("userLeave", username, roomId);
    localStorage.setItem("joined", "false");
    localStorage.removeItem("name");
    localStorage.removeItem("roomId");
    updateContainerDisplay();
});

socket.on("userLeave", username => {
    const li = document.createElement("li");
    li.classList.add("info-message");
    li.innerText = `${username} has left the room!`;
    messagesList.appendChild(li);
});

// ---------------- AUTO JOIN IF ALREADY IN ROOM ----------------
if (localStorage.getItem("joined") === "true") {
    const roomId = localStorage.getItem("roomId");
    const username = localStorage.getItem("name");
    socket.emit("joinRoom", roomId, username);
}

