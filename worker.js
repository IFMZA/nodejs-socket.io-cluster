const http = require("http");
const { Server } = require("socket.io");
const { setupWorker } = require("@socket.io/sticky");
const { createAdapter } = require("@socket.io/cluster-adapter");
const axios = require('axios').default;
const jwt_decode = require("jwt-decode");

const httpServer = http.createServer();
const io = new Server(httpServer);
const cluster = require("cluster");


// use the cluster adapter
io.adapter(createAdapter());

// setup connection with the primary process
setupWorker(io);

const activeUsers = new Set();


console.error(`Worker ${process.pid} is running`);

//Authentication Middleware
io.use(async (socket, next) => {
    console.log('USE: ' + socket.id);
    console.log("socket: ", JSON.stringify(socket));
    if (socket.handshake.query && socket.handshake.query['USER_TYPE'] == "MOBILE") {
        console.log("request-received");
        console.log("socket-handshake: ", JSON.stringify(socket.handshake));
        if (socket.handshake.auth && socket.handshake.auth.token) {
            let { success, message, valid } = await checkTokenIsValid(socket.handshake.auth.token);
            if (success && valid) {
                console.log('valid');
                //Decode the token -> get USERID -> add to socket -> socket.UserId = decodedToken.UserId
                let decoded = jwt_decode(socket.handshake.auth.token);
                try {
                    let _user = decoded;
                    if (_user.id) {
                        socket.userId = _user.id;
                        next();
                    }
                    else {
                        next(new Error("InValid Token"));
                    }
                }
                catch (ex) {
                    next(new Error(ex));
                }
            }
            else {
                next(new Error(message));
            }
        }
        else {
            next(new Error('Authentication error'));
        }
    }
    else if (socket.handshake.query && socket.handshake.query['USER_TYPE'] == "ADMIN") {
        socket.userId = socket.id;
        next();
    }
    else {
        next(new Error('Undefined user type'));
    }
});


io.on("connection", (socket) => {
    console.log('connect: ' + socket.id + ' - userId: ' + socket.userId);
    activeUsers.add(socket.userId);

    // event triggered when a new user connects to the socket
    // socket.on("new_user", (username) => {
    //     socket.userId = username;
    //     activeUsers.add(username);
    //     console.log("Adding -> " + username)
    //     io.emit("new_user", [...activeUsers]);
    //     console.log("users Count: " + activeUsers.size)
    // });
    // event triggered when new post sent to the socket
    socket.on("propagate", (itemToPropagate) => {
        socket.broadcast.emit("propagate", itemToPropagate);
    });

    socket.on("disconnect", () => {
        console.log("deleting -> " + socket.userId);
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", [...activeUsers]);
    });
});


async function checkTokenIsValid(token) {
    console.log('Check-Token-API');
    try {
        let token_result = await axios.post('http://000.000.000.00/api/Security/Authentication/ValidateToken', {
            accessToken: token
        });
        console.log(token_result.data);
        if (token_result.data && "isValid" in token_result.data) {
            if (token_result.data.isValid == true) {
                return { success: true, message: "", valid: true };
            }
            else {
                return { success: true, message: "Authentication error", valid: false };
            }
        }
        else {
            return { success: false, message: "Validation response isValid key missing", valid: false };
        }
    }
    catch (ex) {
        console.error(ex);
        return { success: false, message: "Error while requesting validation API", valid: false };
    }

}