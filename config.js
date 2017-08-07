"use strict";

const localDatabase = 0;
module.exports = {
  yybxServiceUrl: "http://192.168.100.9/szhtkjws/YybxService.asmx?wsdl",
  timeOut: {
    dbConnect: 10,
    dbQuery: 60
  },
  dbPrimary: {
    storeType: "MSSql",
    driver: "SQL Server Native Client 11.0",
    server: localDatabase ? "." : "192.168.100.4",
    database: "gxcw40",
    userId: "tc_gxcw40",
    userPwd: "gxcw40"
  },
  dbSecondary: {
    storeType: "MSSql",
    driver: "SQL Server Native Client 11.0",
    server: localDatabase ? "." : "192.168.100.2",
    database: "PayHelper",
    userId: "PayHelper_AutoUser",
    userPwd: "FV6\u0016\u000fM\u000f"
  },
  http: {
    port: 80
  },
  cnStr: (dbName = "dbPrimary") => {
    const db = module.exports[dbName];
    return `Driver={${db.driver}};Server=${db.server};Database=${db.database};UID=${db.userId};PWD=${db.userPwd};Connection Timeout=30`;
  },
  socketCCB: {
    cnOptions: {
      host: "192.168.100.3",
      port: 12345
    },
    custId: "R110000001814#0T",//客户号 varChar(21) F 字符型char，网银客户号
    userId: "WLPT01", // 操作员号 varChar(6) F 20051210后必须使用
    password: "999999", //密码 varChar(32) F 操作员密码
    zeroBlanceAcctId: "11050188360008224428"//零余额账号 varChar(32)
  }
};
