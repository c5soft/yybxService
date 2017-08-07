const net = require("net");
const soap = require("strong-soap").soap;
const XMLHandler = soap.XMLHandler;
const xmlHandler = new XMLHandler();
const Iconv = require("iconv").Iconv;
//const toGBK = new Iconv("UTF-8", "GBK").convert;
//const fromGBK = new Iconv("GBK", "UTF-8").convert;
//const xmlHeaderGB2312 = "<?xml version=\"1.0\" encoding=\"GB2312\" standalone=\"yes\" ?>";
const toGB18030 = new Iconv("UTF-8", "GB18030").convert;
const fromGB18030 = new Iconv("GB18030", "UTF-8").convert;
const xmlHeaderGB18030 = "<?xml version=\"1.0\" encoding=\"GB18030\" standalone=\"yes\" ?>";
const config = require("../config").socketCCB;
const zeroBlanceAcctId=config.zeroBlanceAcctId;

const nextSN = (prefix = "9") => {
  const now = new Date().toISOString();
  return prefix + now.slice(2, 4) + now.slice(5, 7) + now.slice(8, 10) +
    now.slice(11, 13) + now.slice(14, 16) + now.slice(17, 19) + now.slice(20, 23);
};

function requestCCB(txCode, txInfo, options = {}) {
  const {debug = false, preprocess = false} = options;

  return new Promise((resolve, reject) => {
    let count = 0, results = [];

    const prepareData = (txCode, txInfo) => {
      let data = {
        TX: {
          REQUEST_SN: nextSN(), //请求序列号 varChar(16) F 只可以使用数字
          CUST_ID: config.custId,//客户号 varChar(21) F 字符型char，网银客户号
          USER_ID: config.userId, // 操作员号 varChar(6) F 20051210后必须使用
          PASSWORD: config.password, //密码 varChar(32) F 操作员密码
          TX_CODE: txCode, //交易码 varChar(6) F 交易请求码
          LANGUAGE: "CN", // 语言 varChar(2) F CN
          TX_INFO: txInfo
        }
      };
      data = xmlHandler.jsonToXml(null, null, null, data).end({pretty: false});
      data = xmlHeaderGB18030 + data;
      //console.log(data);
      data = toGB18030(data);
      return data;
    };
    const sendData = (txCode, txInfo) => {
      const data = prepareData(txCode, txInfo);
      client.write(data);
    };
    const client = net.createConnection(config.cnOptions, () => {
      sendData(txCode, txInfo);
    });

    client.on("data", (data) => {
      results.push(data);
      count++;
      if (debug)
        console.log(count);
    });

    client.on("error", (err) => {
      reject(err);
    });

    client.on("end", () => {
      let totalLength = 0;
      results.forEach(r => {
        totalLength += r.length;
      });
      let data = Buffer.concat(results, totalLength);
      data = fromGB18030(data).toString();
      if (debug)
        console.log(data);
      if (preprocess)
        data = preprocess(data);
      data = xmlHandler.xmlToJson(null, data);
      resolve(data.TX);
    });
  });
}



module.exports = {
  requestCCB,
  zeroBlanceAcctId
};

