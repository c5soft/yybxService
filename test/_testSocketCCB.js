const {requestCCB, zeroBlanceAcctId} = require("../util/utilSocketCCB");
const {cardNoValid} = require("../util/utilLuhm");
const {gwkCheck} = require("../service/intfCCB");
/*
 update zwzgzd set sfzh=x.证件编号,ygmc=x.姓名, mobie=convert(varchar(20),x.联系资料)
 from zwzgzd z with(nolock) join PayRoll.dbo.员工信息 x with(nolock) ON z.ygbh=x.编号
 where x.证件编号 is not null
 */
const checkCard = 1;
if (checkCard) {
  gwkCheck().then(bugCards => {
    if (bugCards.length === 0)
      console.log("未发现有问题的公务卡");
    else {
      console.log("序号\t状态\t工资号\t卡号\t姓名\t身份证号\t部门\t电话");
      bugCards.forEach((p, i) => {
        console.log((i + 1) + "\t " + (p.valid ? "+卡未登记 " : "-卡号无效 ") + p.staffId + "\t " + p.name + "\t " + p.cardNo + "\t " + p.id + "\t" + p.dept + "\t" + p.mobile);
      });
    }
  }).catch(err => {
    console.log(err);
  });
  return;
}


let args = "工资号,张丽英,6283660105631770,20170619,3100.00".split(",");
args = "工资号,尹靖东,6283660105840413,20170629,100".split(",");
args = "工资号,尹靖东,6283660105840413,20170705,500".split(",");
args = "201371,田永强,6283660105840355,20170616,360".split(",");
args = "201057,韩保峰,6283660105840637,20170616,100".split(",");
args = "201057,韩保峰,6283660105840546,20170616,100".split(",");
let q = {
  id: args[0],
  name: args[1],
  cardNo: args[2],
  date: args[3],
  amount: args[4]
};

let txCode = "6WB101", txInfo = {
  FuncCode: "000",//功能代码 varChar(3) F 000：查询
  PageNo: 1,//页号 NUMBER(8) F
  AssignAcctId: zeroBlanceAcctId,//零余额账号 varChar(32) F
  CardId: q.cardNo,//公务卡号 varChar(32) T
  CardName: null,//持卡人姓名 varChar(20) T
  IdType: "100",//证件类型 varChar(3) T 户口簿:130 军官证:112 警官证:122 居民身份证:100 其它证件（个人）:199 士兵证:111 外国护照:142 武警士兵证:121 武警文职干部证:123 文职干部证:113 中国护照:141
  IdCode: null//"6283660105840355"//"110108196611059378" //证件号码 varChar(20) T
};

let txCodeOld = "6WB102", txInfoOld = {
  PageNo: 1,// 页号 NUMBER(8) F
  CardId: null,// q.cardNo,// 公务卡号 varChar(32) T
  ExpenseDate: q.date,// 消费日期 varChar(8) F YYYYMMDD
  ExpenseAmount: q.amount,// 消费金额 NUMBER(18,2) F
  ExpenseCurCode: "CNY",// 消费币种     varChar(3) F CNY:人民币 AUD:澳大利亚元 HKD:港币 CAD:加拿大元 USD:美元 EUR:欧元 JPY:日元 SGD:新加坡元 GBP:英镑
  CardName: null// q.name// 持卡人姓名 varChar(20) T
};

let txCodeNew = "6WB121", txInfoNew = {
  PAGE_JUMP: 1,// 页号 NUMBER(8) F
  Cst_AccNo: zeroBlanceAcctId,// 零余额账户 varChar(32) F
  CrdHldr_Nm_ShrtNm: q.name,// 持卡人姓名 varChar(240) F
  CrCrd_CardNo: q.cardNo,// 公务卡卡号 varChar(16) F
  Txn_Dt: q.date,// 交易日期 varChar(8) F YYYYMMDD
  TxnAmt: q.amount,// 交易金额 NUMBER(18,2) F
  Enqr_Tp: "1"// 查询类型 varChar(2) F   1：消费记录；2：退款记录；
};

const outBankList = false &&
  ((result) => {
    let bankList = result.TX_INFO.list;
    bankList.forEach(b => {
      console.log("UNION ALL SELECT '" + b.BANK_CODE + "','" + b.BANK_NAME + "'");
    });
  });
if (outBankList) {
  txCode = "6W0201";
  txInfo = {};
}

/*
//查询交易明细
txCode = "6WY101", txInfo = {
  ACCNO1: "11001045300053003131-0001",// 账号 varChar(32) F
  STARTDATE: "20170701",//开始时间 YYYYMMDD F
  ENDDATE: "20170703",//结束时间 YYYYMMDD F
  BARGAIN_FLAG: null,// 交易方向 Char(1) T
  CHECK_ACC_NO: null,// 对方账户 varChar(32) T 0-借 转出 ,1-贷 转入
  CHECK_ACC_NAME: null,//  对方账户名称 varChar(60) T
  REMARK: null,// 备注 varChar(99) T
  LOW_AMT: null,// 最小金额 Decimal(16,2) T
  HIGH_AMT: null,// 最大金额 Decimal(16,2) T
  PAGE: 1,// 起始页      Int T 查询页次，整数>0
  POSTSTR: null,// 定位串 varChar(100) T
  TOTAL_RECORD: 100,// 每页记录数 Int T 默认为10，大于0小于等于200，后续查询时的输入值，必须与首次查询设定的值相等
  DET_NO: null // 起始明细号 Int T 此明细号用于快速查询某条记录以后的明细数据(可参考返回报文DET_NO填写此值)
};
*/
const debug = false;
const preprocess = false;

requestCCB(txCode, txInfo, {debug, preprocess}).then(result => {
  if (outBankList)
    outBankList(result);
  else
    console.log(JSON.stringify(result, 0, 2));
}).catch(err => {
  console.log(err);
});


