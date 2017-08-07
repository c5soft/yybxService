const yybxService = require("./service/yybxService");
const soap = yybxService.soap;
const http = require("http");
const port=yybxService.port;
const server = http.createServer(function(request, response) {
  response.end("404: Not Found: " + request.url);
});
server.listen(port);
soap.listen(server, {
  // Server options.
  path: "/szhtkjws/YybxService.asmx",
  services: yybxService.services,
  xml: yybxService.wsdl,
  // WSDL options.
  attributesKey: "$attributes",
  valueKey: "$value",
  xmlKey: "$xml"
});
console.log('Soap Server Listening at port:'+port);

