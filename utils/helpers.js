const trimString = (str, max) =>
  str.length > max ? `${str.slice(0, max - 3)}...` : str;

module.exports = {
  trimString,
};
