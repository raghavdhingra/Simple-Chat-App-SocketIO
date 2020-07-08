const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const router = require("./router");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;
const server = http.createServer(app);
const io = socketIO(server);
app.use(router);

io.on("connection", (socket) => {
  console.log("A new connection is build");
  socket.on("disconnect", () => {
    console.log("Connection lost");
  });
});

server.listen(port, () => {
  console.log(`Listening on PORT: ${port}`);
});
