"use strict";

function receiveBody(request, response) {
  const body = [];
  return new Promise((resolve, reject) => {
    request.on("error", function(err) {
      reject(err);
    }).on("data", function(chunk) {
      body.push(chunk);
    }).on("end", function() {
      resolve(Buffer.concat(body).toString());
    });
  });
}
module.exports = {
  receiveBody
};