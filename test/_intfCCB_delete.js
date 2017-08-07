const {requestCCB, zeroBlanceAcctId} = require("../util/utilSocketCCB");
const db = require("../util/utilDatabaseMSSql");
const {cardIdValid} = require("../util/utilLuhm");

//公务卡检查
async function gwkCheck(debug = false,cnStr=db.dbPrimary) {
  return new Promise((resolve,reject)=>{
    db.execute(`select z.ygbh staffId, z.ygmc name,z.sfzh id,z.gwkh cardNo,b.bmbh+' '+b.bmmc dept,z.mobie mobile
     from zwzgzd z join zwbmzd b on z.bmbh=b.bmbh where z.gwkh>'' order by z.gwkh desc`, [],cnStr)
      .then(results => {
        const pendings = results[0];
        const bugCards = [];
        const groupSize = 10;

        const checkCardInfo = (startGroup, debug = false) => {
          const checks = [];
          const cards = [];
          const stopPos = pendings.length;
          const stopGroup = Math.ceil(stopPos / groupSize);
          if (startGroup === stopGroup) {
            resolve(bugCards);
          } else {
            let start = startGroup * groupSize;
            let stop = (startGroup + 1) * groupSize;
            if (stop > stopPos) stop = stopPos;
            if (startGroup % 10 === 0)
              console.log(new Date().toLocaleTimeString() + " 正处理第 " + start + "-" + stop + " 条记录...");
            for (let i = start; i < stop; i++) {
              const p = pendings[i];
              cards.push(p);
              p.valid = cardIdValid(p.cardNo);
              if (!p.valid) {
                checks.push(Promise.resolve({msg: "卡号有误"}));
              } else {
                const txCode = "6WB101", txInfo = {
                  FuncCode: "000",//功能代码 varChar(3) F 000：查询
                  PageNo: 1,//页号 NUMBER(8) F
                  AssignAcctId: zeroBlanceAcctId,//零余额账号 varChar(32) F
                  CardId: p.cardNo,//公务卡号 varChar(32) T
                  CardName: null,//持卡人姓名 varChar(20) T
                  IdType: "100",//证件类型 varChar(3) T 户口簿:130 军官证:112 警官证:122 居民身份证:100 其它证件（个人）:199 士兵证:111 外国护照:142 武警士兵证:121 武警文职干部证:123 文职干部证:113 中国护照:141
                  IdCode: null//"6283660105840355"//"110108196611059378" //证件号码 varChar(20) T
                };
                if (debug)
                  console.log("process " + p.cardNo + " ...");
                checks.push(requestCCB(txCode, txInfo));
              }
            }
            Promise.all(checks).then(results => {
              results.forEach((result, i) => {
                const p = cards[i];
                if (result.msg) {
                  if (debug)
                    console.log("---------------卡号有误:" + p.cardNo + " " + p.staffId + " " + p.name + " " + p.id);
                  bugCards.push(p);
                } else if (result.RETURN_CODE === "000000") {
                  if (parseInt(result.TX_INFO.RecCount) === 0) {
                    if (debug)
                      console.log("---------------卡未登记:" + p.cardNo + " " + p.staffId + " " + p.name + " " + p.id);
                    bugCards.push(p);
                  }
                } else {//出现意外，需要重新处理
                  pendings.push(p);
                  console.log(JSON.stringify(result));
                }
              });
              checkCardInfo(startGroup + 1, debug);
            }).catch(err => {
              console.log(err);
              checkCardInfo(startGroup + 1, debug);
            });
          }
        };
        checkCardInfo(0, debug);
      }).catch(err => {
      reject(err);
    });
  });
}

module.exports = {
  gwkCheck
};

