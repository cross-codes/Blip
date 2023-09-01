export const generateMessage = function(username, text) {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

export const generateLocationMessage = function(username, url) {
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  };
};
