import Filter from "bad-words";
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { generateLocationMessage, generateMessage } from "./utils/messages.js";
import { addUser, getUser, getUsersInRoom, removeUser } from "./utils/users.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(new URL("../public", import.meta.url).pathname);

app.use(express.static(publicPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username,
      room,
    });

    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage("[Server]", "Welcome"),
    );
    socket.broadcast.to(user.room).emit("message", generateMessage("[Server]", `${user.username} has joined the room`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("(F) Reason: Profanity not permitted");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback("(S)");
  });

  socket.on("sendLocation", (locationObject, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, locationObject));
    callback("Location shared");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", generateMessage("[Server]", `${user.username} left the room`));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
