const cluster = require("cluster");
const http = require("http");
const { setupMaster } = require("@socket.io/sticky");
const { setupPrimary } = require("@socket.io/cluster-adapter");
const recluster = require("recluster");
const path = require("path");

const httpServer = http.createServer();

// setup sticky sessions
setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
});

// setup connections between the workers
setupPrimary();

// needed for packets containing buffers (you can ignore it if you only send plaintext objects)
// Node.js < 16.0.0
cluster.setupMaster({
    serialization: "advanced",
});

// Node.js > 16.0.0
// cluster.setupPrimary({
//   serialization: "advanced",
// });

httpServer.listen(5000);

const balancer = recluster(path.join(__dirname, "worker.js"), { workers: 3 });

balancer.run();

process.on('SIGUSR2', function (worker) {
    console.log('Got SIGUSR2, reloading cluster...');
    console.log(`Worker ${worker.process.pid} died`);
    try {
        cluster.reload();
    } catch (error) {
        console.warn('cluster-reload-error')
    }

});

console.log("spawned cluster, kill -s SIGUSR2", process.pid, "to reload");