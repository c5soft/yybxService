"use strict";
function magic(s) {
  const cutPos = Math.floor(s.length / 2);
  return s.slice(cutPos) + s.slice(0, cutPos);
}
function unmagic(s) {
  const cutPos = Math.ceil(s.length / 2);
  return s.slice(cutPos) + s.slice(0, cutPos);
}
module.exports = {
  pack: function(obj) {
    const s = JSON.stringify(obj);
    const b = new Buffer(s);
    const e = magic(b.toString("base64"));
    return e;
  },
  unpack: function unpack(pack) {
    try {
      const d = unmagic(pack);
      const b = new Buffer(d, "base64");
      return JSON.parse(b.toString());
    } catch (e) {
      return pack;
    }
  }
  // magic:magic,
  // unmagic:unmagic
};