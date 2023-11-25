const express = require("express");
const socket = require("socket.io");


// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);


const activeUsers = new Set();

io.on("connection", function (socket) {
    console.log("Made socket connection");
    console.log(socket.client.id);
    console.log(socket.handshake.auth.token);
    console.log(socket.handshake.query['my-key'])

    socket.on("new user", (username) => {
        socket.userId = username;
        activeUsers.add(username);
        console.log("Adding -> " + username)
        io.emit("new user", [...activeUsers]);
        console.log("users Count: " + activeUsers.size)
    });

    socket.on("disconnect", () => {
        console.log("deleting -> " + socket.userId);
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", [...activeUsers]);
    });
});