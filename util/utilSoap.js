"use strict";
function flatArgs(args) {
  const keys = Object.keys(args);
  const result = {};
  keys.forEach(k => {
    result[k] = args[k].$value;
  });
  return result;
}

module.exports = {
  flatArgs
};