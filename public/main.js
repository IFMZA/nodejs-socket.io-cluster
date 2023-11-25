const socket = io("http://localhost:5000", {
    reconnectionDelayMax: 10000,
    auth: {
        token: "xyz"
    },
    query: {
        "USER_TYPE": "ADMIN"
    }
});

socket.on('connect_error', function (err) {
    alert(err);
})


//#region Send Post to Socket
function sendPostToSocket() {
    let POST = {
        id: '123',
        code: 'code_test',
        post: 'test post body',
        video: 'http://xyz.com/vid.mp4',
        approveDate: new Date(),
        userName: 'USERNAME1',
        userAvatar: 'http://xyz.com/img.jpg',
        postType: "APPROVED",
        points: 50,
        images: [
            { fileName: "http://xyz.com/img.jpg" },
            { fileName: "http://xyz.com/img.jpg" },
            { fileName: "http://xyz.com/img.jpg" }
        ]
    };
    socket.emit("propagate", POST);
}
socket.on("propagate", function (post) {
    alert(JSON.stringify(post));
});
//#endregion Send Post to Socket


//#region Socket Connection
function connectToSocket() {
    const username = document.getElementById("username");
    socket.emit("new_user", username.value);
}

function disconnectFromSocket() {
    const username = document.getElementById("username");
    socket.emit("disconnect", username.value);
}
window.onbeforeunload = disconnectFromSocket;
//#endregion Socket Connection