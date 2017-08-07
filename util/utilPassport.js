"use strict";

function intToAZ(n) {
  const cAtoZ = "JHGFDQWUIOPZXCVBERTYNMLKSA";
  var m;
  var result = "";
  while (n > 0) {
    m = n % 26;
    if (m === 0) {
      m = 26;
    }
    result = cAtoZ.charAt(m - 1) + result;
    n = Math.floor((n - m) / 26);
  }
  return result;
}

module.exports = function getPassport(ADate) {
  var y, m, d;
  if (!ADate) {
    ADate = new Date();
  }
  //ADate=ADate.add(1,"day");
  //console.log(ADate);
  y = ADate.getFullYear();
  m = ADate.getMonth() + 1;
  d = ADate.getDate();
  //console.log("y="+y+",m="+m+",d="+d);
  return intToAZ(1966 * y * d + 1105 * m + y - m + d);
};


