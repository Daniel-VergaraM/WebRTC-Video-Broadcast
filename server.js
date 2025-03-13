const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname + "/public"));

let connections = [];
const PORT = 4000;

io.on("connection", (socket) => {
  connections.push(socket.id);
  console.log(`Hay ${connections.length} sockets conectados`);

  socket.on("broadcaster", () => {
    socket.broadcast.emit("broadcaster");
  });

  socket.on("watcher", () => {
    socket.broadcast.emit("watcher", socket.id);
  });

  socket.on("offer", (id, description) => {
    io.to(id).emit("offer", socket.id, description);
  });

  socket.on("answer", (id, description) => {
    io.to(id).emit("answer", socket.id, description);
  });

  socket.on("candidate", (id, candidate) => {
    io.to(id).emit("candidate", socket.id, candidate);
  });

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket.id), 1);
    console.log(`Hay ${connections.length} sockets conectados`);
    socket.broadcast.emit("disconnectPeer", socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
