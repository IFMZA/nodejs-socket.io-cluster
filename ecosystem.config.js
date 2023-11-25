module.exports = {
    apps : [{
      script    : "worker.js",
      instances : "2",
      exec_mode : "cluster"
    }]
  }