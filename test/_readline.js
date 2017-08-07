var readline = require("readline");
var fs = require("fs");
var os = require("os");

var fReadName = "C:/Users/Administrator/Desktop/trace.log";
var fWriteName = "C:/Users/Administrator/Desktop/trace.txt";
var fRead = fs.createReadStream(fReadName);
var fWrite = fs.createWriteStream(fWriteName);


var objReadline = readline.createInterface({
  input: fRead
// 这是另一种复制方式，这样on('line')里就不必再调用fWrite.write(line)，当只是纯粹复制文件时推荐使用
// 但文件末尾会多算一次index计数   sodino.com
// output: fWrite,
//  terminal: true
});

var cmds = {};
var index = 1;
objReadline.on("line", (line) => {
  var list = /^ {2}<TX_CODE>(\w+)<\/TX_CODE>$/g.exec(line);
  if (list) {
    var cmd = list[1];
    if (!cmds[cmd])
      cmds[cmd] = 1;
    else
      cmds[cmd] += 1;
    if (list.length > 2)
      console.log(index, JSON.stringify(list));
  }
  index++;
});

objReadline.on("close", () => {
  const keys=Object.keys(cmds).sort();
  const result=keys.map(k=>k+'='+cmds[k]);
  console.log(JSON.stringify(result, 0, 2));
  //console.log('readline close...');
});