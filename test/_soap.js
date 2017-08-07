//const soap = require("strong-soap").soap;
const soap = require("soap");
//const url = "http://wszz.cau.edu.cn/szhtkjws/YybxService.asmx?wsdl";
const url = "http://192.168.100.9/szhtkjws_gwk/QueryOfficeConsumeRecordsServicea.asmx?wsdl";
const util = require("../util/utilSoap");
soap.createClient(url, function (err, client) {
  const query =client.Query;  // client.QueryOfficeConsumeRecordsServicea.QueryOfficeConsumeRecordsServiceaSoap.Query;
  //const argList="工资号,张丽英,6283660105631770,20170619,3100".split(",");
  //const argList="工资号,苏伟,6283660105385120,20170701,3198.00".split(",");

  //const argList="工资号,苏伟,6283660105385120,20170629,3189.20".split(",");
  //const argList="工资号,袁芳,6283660105336057,20170625,336.00".split(",");

  //const argList="工资号,袁芳,6283660105336057,20170622,338.00".split(",");
  //const argList="201163,张万军,6283660105840322,20170627,900.00".split(",");

  //                       0         1         2                                 3                4
  //const argList="工资号,尹靖东,6283660105840413,20170629,3600".split(",");
  const argList = "工资号,尹靖东,6283660105840413,20170705,500".split(",");

  const args = {
    cardName: null,//argList[1],
    cardNo: null,//argList[2],
    beginDate: argList[3],
    //endDate: argList[3],
    amount: parseFloat(argList[4])
  };
  query(args, function (err, result) {
    if (err)
      console.error(err);
    else
      console.log(JSON.stringify(result, false, " "));
  });
  /*
   const args = {swhere: "and yydh='03201706010010'"};
   client.GetPzfl(args, function(err, result) {
   if (err)
   console.error(err);
   else
   console.log(JSON.stringify(result, false, "  "));
   }, {timeout: 5000, connection: "keep-alive", time: true});
   */
  //const des = client.describe();
  //console.log(JSON.stringify(des, 0, 2));
});
/*
 const s = util.flatArgs({
 "yydh": {
 "attributes": {
 "$xsiType": {
 "type": "string",
 "xmlns": "http://www.w3.org/2001/XMLSchema"
 }
 },
 "$value": "PH17060615"
 },
 "zt": {
 "attributes": {
 "$xsiType": {
 "type": "string",
 "xmlns": "http://www.w3.org/2001/XMLSchema"
 }
 },
 "$value": "3"
 },
 "kjnd": {
 "attributes": {
 "$xsiType": {
 "type": "string",
 "xmlns": "http://www.w3.org/2001/XMLSchema"
 }
 },
 "$value": "2017"
 },
 "kjqj": {
 "attributes": {
 "$xsiType": {
 "type": "string",
 "xmlns": "http://www.w3.org/2001/XMLSchema"
 }
 },
 "$value": "06"
 },
 "pzlx": {
 "attributes": {
 "$xsiType": {
 "type": "string",
 "xmlns": "http://www.w3.org/2001/XMLSchema"
 }
 },
 "$value": "01"
 },
 "pzbh": {
 "attributes": {
 "$xsiType": {
 "type": "string",
 "xmlns": "http://www.w3.org/2001/XMLSchema"
 }
 },
 "$value": "00004"
 },
 "sm": {
 "attributes": {
 "$xsiType": {
 "type": "string",
 "xmlns": "http://www.w3.org/2001/XMLSchema"
 }
 },
 "$value": "报销成功"
 }
 });
 console.log(JSON.stringify(s, 0, 2));
 console.log(s.yydh);
 const r =
 {
 "yydh": "PH17060615",
 "zt": "3",
 "kjnd": "2017",
 "kjqj": "06",
 "pzlx": "01",
 "pzbh": "00004",
 "sm": "报销成功"
 };
 */
