import Filter from "bad-words";
const users = [];

export const addUser = function({ id, username, room }) {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    const filter = new Filter();
    return user.room === room && user.username === username && !(filter.isProfane(user.username))
      && user.username !== "[Server]";
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username cannot be used",
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

export const removeUser = function(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

export const getUser = function(id) {
  return users.find((user) => user.id === id);
};

export const getUsersInRoom = function(room) {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};
