const users = [];

const userFunctions = {};

userFunctions.addUsers = ({ id, name, room }) => {
  name = name.trim();
  room = room.trim().toLowerCase();

  const IsExistingUser = users.find(
    (user) => user.name === name && user.room === room
  );
  if (IsExistingUser) return { error: "User name is taken" };
  const user = { id, name, room };

  users.push(user);
  return { user };
};

userFunctions.removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

userFunctions.getUser = (id) => users.find((user) => user.id === id);

userFunctions.getUsersInRoom = (room) =>
  users.filter((user) => user.room === room);

module.exports = userFunctions;
