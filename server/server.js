const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
// const cors = require("cors");

const router = require("./router");
const userFunctions = require("./users");
const { getUser } = require("./users");

const app = express();
// app.use(cors({ origin: "*" }));
app.use(router);
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socketIO(server);
// const listenIO = require("socket.io").listen(server);
// io.set("origins", "*");

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = userFunctions.addUsers({
      id: socket.id,
      name,
      room,
    });
    if (error) return callback(error);
    socket.emit("message", {
      user: "admin",
      text: `Hi ${user.name}, Welcome to the ${user.room} room.`,
    });
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has joined the room`,
    });
    socket.join(user.room);
    setTimeout(() => {
      let totalMembers = userFunctions.getUsersInRoom(room);
      io.to(user.room).emit("totalMembers", { totalMembers });
    }, 50);
  });

  socket.on("removeUser", (id) => {
    const user = userFunctions.getUser(id);
    io.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has been removed by admin`,
    });
    io.to(user.id).emit("deleteUser");
    userFunctions.removeUser(id);
    let totalMembers = userFunctions.getUsersInRoom(user.room);
    io.to(user.room).emit("totalMembers", { totalMembers });
  });

  socket.on("sendMessage", (message) => {
    try {
      const user = userFunctions.getUser(socket.id);
      io.to(user.room).emit("message", { user: user.name, text: message });
    } catch (err) {}
  });

  socket.on("masterDelete", () => {
    const user = userFunctions.getUser(socket.id);
    io.to(user.room).emit("masterDelete");
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    try {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left the room`,
      });
      userFunctions.removeUser(socket.id);
      let totalMembers = userFunctions.getUsersInRoom(user.room);
      io.to(user.room).emit("totalMembers", { totalMembers });
    } catch (err) {}
  });
});

server.listen(port, () => {
  console.log(`Listening on PORT: ${port}`);
});
