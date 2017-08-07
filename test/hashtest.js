const crypto = require("crypto");
const pe=require("../util/utilParseExp");

console.log(pe.parseExp("a,b,=c,>=d,e~f","姓名",pe.pftNum,8," "));
/*
let hash, i;
for (i = 0; i < 1; i++) {
  hash = crypto.createHash("sha256");
  hash.update(i.toString());
  console.log(hash.digest("hex"));
}
console.log(" ==%s==%d",0,1);

const a={abc:5,aaa:"Yes"};
const {abc,aaa}=a;
console.log(abc);
console.log(aaa);
*/