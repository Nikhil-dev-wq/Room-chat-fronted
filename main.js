const roomIdInput = document.getElementById("room_id_input");
const joinButton = document.getElementById("join-btn");
const roomIdContainer = document.querySelector(".room_id_container");
const mainContainer = document.querySelector(".main_container");
const nameInput = document.getElementById("name_input");
let userName = "";
let isJoined = false
let Room_data = {};
const socket = io("https://room-chat-gpxz.onrender.com/");

joinButton.onclick = () => {
    const roomId = roomIdInput.value.trim();
    const name = nameInput.value.trim();
    userName = name;
    if (!roomId || !name) return console.log("Cannot be empty!");

    fetch("https://room-chat-gpxz.onrender.com/api/room_id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId })
    })
        .then(res => res.json())
        .then(data => {
            isJoined = true;
            Room_data = data.Room;
            document.getElementById("room_id").textContent = `Room ID: ${Room_data.room_id}`;
            checkJoint();
            socket.emit("join_room", { room_id: Room_data.room_id, user: "me" });
        })
        .catch(console.error);
};

function checkJoint() {
    if (isJoined) {
        roomIdContainer.style.display = "none";
        mainContainer.style.display = "flex";
        loadOldChats();

    } else {
        roomIdContainer.style.display = "flex";
        mainContainer.style.display = "none";
        Room_data = {}; // reset room data when not joined
    }
}

// Initial check
checkJoint();


// chat logic

const messageInput = document.getElementById("message_input")
const sendBtn = document.getElementById("send_btn")
const chatMessages = document.getElementById("chat_messages");

sendBtn.addEventListener("click", () => {
    if (messageInput.value.trim() == "") {
        return;
    }

    socket.emit("send_message", { room_id: Room_data.room_id, "user": userName, "message": messageInput.value.trim() })
    messageInput.value = "";
})

socket.on("receive_message", data => {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = `${data.user}: ${data.message}`;

    msgDiv.classList.add("message");
    if (data.user == userName) {
        msgDiv.classList.add("self");
    }
    else {
        msgDiv.classList.add("other");
    }

    chatMessages.appendChild(msgDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

function loadOldChats() {
    if (!Room_data.chats) return;
    Room_data.chats.forEach(chat => {

        const msgDiv = document.createElement("div");
        msgDiv.textContent = `${chat.user}: ${chat.message}`;

        msgDiv.classList.add("message");
        if (chat.user == userName) {
            msgDiv.classList.add("self");
        }
        else {
            msgDiv.classList.add("other");
        }

        chatMessages.appendChild(msgDiv);

    })
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

