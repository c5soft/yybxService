const {TaskCheckGWK, TaskQueryAllPages, zeroBlanceAcctId} = require("../service/intfCCB");

const debug = false;
const checkId = false;
const checkCard = false;

if (checkCard)
    new TaskCheckGWK({debug, checkId}).execute()
        .then(bugCards => {
            if (bugCards.length === 0)
                console.log("未发现有问题的公务卡");
            else {
                console.log("序号\t工资号\t姓名\t卡号\t身份证号\t部门\t电话\t状态");
                bugCards.forEach((p, i) => {
                    console.log((i + 1) + " \t" + p.staffId + " \t" + p.name + " \t" + p.cardNo + " \t" + p.id + " \t" + p.dept + " \t" + p.mobile + " \t" + p.bug);
                });
            }
        }).catch(err => {
        console.log(err);
    });

let txCode, txInfo;


txCode = "6WB006"; //授权支付情况查询
txInfo = {
    FuncCode: "000",// 功能代码 varChar(3) F 000：查询
    PageNo: 1,// 页号 NUMBER(8) F
    AcctId: zeroBlanceAcctId,//  零余额账号 varChar(32) F
    TxType: "00",//  交易类型 varChar(2) F 01 正常交易 02 退回交易 03 更正交易 00 全部交易
    Subject: null,// 科目编号 varChar(13) T
    BeginDate: "20170701",// 起始日期 varChar(8) F YYYYMMDD
    EndDate: "20170727",// 终止日期 varChar(8) F YYYYMMDD
    Purpose: null,// 用途 varChar(256) T
    PrimOrdKey: null,// 主要排序关键字 varChar(30) T 交易日期Txdate 科目编号Subject 基层预算单位BacalUserCode 交易时间Txtime 关联号ControlCode 经济分类EcoType 机构号DepId 账号AcctId 金额TxAmount 收支管理FundType 预算来源BudgetType
    SecdOrdKey: null,// 次要排序关键字 varChar(30) T 同上
    ThrdOrdKey: null,// 第三排序关键字 varChar(30) T 同上
    TxInAmount: null,// 最小发生额 NUMBER(18,2) T
    TxOutAmount: null,// 最大发生额 NUMBER(18,2) T
    FanalInBranchName: null,// 最终收款人开户行名称 varChar(50) T
    FundType: null,// 收支管理 varChar(2) T
    Item: null,// 项目 varChar(20) T
    ControlCode: null,// 关联号 varChar(10) T 目前为3位
    EcoType: null,// 经济分类 varChar(10) T
    BudgetType: "3" //预算来源信息 varChar(1) F 1:当年预算 2:上年结余 3:全部
};

txCode = "6WB007"; //交易流水查询
txInfo = {
    FuncCode: "000",// 功能代码 varChar(3) F 000：查询(按流水号查询）002：查询(按批次号查询）
    PageNo: 1,// 页号 NUMBER(8) F
    BeginDate: "20170701",// 开始时间 varChar(8) F YYYYMMDD
    EndDate: "20170727",// 终止时间 varChar(8) F YYYYMMDD
    NBnkSeqNo: null,// 网银流水号 varChar(12) T
    FundType: null,// 收支管理 varChar(2) T
    Subject: null,// 科目编号 varChar(13) T
    EcoType: null,// 经济分类 varChar(10) T
    PayOutType: null,// 支付类型 varChar(9) T
    BudgetType: null,// 预算来源信息 varChar(1) T
    Item: null,// 项目编码 varChar(16) T
    ControlCode: null,// 关联号 varChar(10) T 目前为3位
    BacalAcctId: zeroBlanceAcctId,// 付款人账号 varChar(32) F 零余额账号
    FanalInAcctId: null,// 收款人账号 varChar(32) T
    TxAmount: null,// 金额 NUMBER(18,2) T
    PurPose: null,// 用途 varChar(256) T
    TxFlag: 1,// 交易结果标志 varChar(1) F 0-全部 1-成功 2-失败 3-异常
    BatchNo: null// 制单批次号 varChar(12) T FuncCode等于000或者001时无需输入，等于002或者003时可以输入
};

txCode = "6WB008"; //对账单查询
txInfo = {
    FuncCode: "002",// 功能代码 varChar(3) F 000：查询(按科目查询）002：查询(按关联号查询)
    PageNo: 1,// 页号 NUMBER(8) F
    QueryType: 1,// 查询类型 varChar(1) F 1:按时间段查询，2:按年月查询
    YearMonth: null,// 年月 varChar(6) T 如QueryType为2本字段必输，YYYYMM
    AcctId: zeroBlanceAcctId,// 零余额账号 varChar(32) F
    BeginDate: "20170701",// 起始日期 varChar(8) T 如QueryType为1本字段必输，YYYYMMDD
    EndDate: "20170727",// 终止日期 varChar(8) T 如QueryType为1本字段必输，YYYYMMDD
    BudgetType: 3 // 预算来源信息 varChar(1) F 1:当年预算 2:上年结余 3:全部
};


txCode = "6WB009"; //明细对账单查询
txInfo = {
    FuncCode: "004", //功能代码 varChar(3) F 000: 数据生成（按科目查询） ,001: 查询 （按科目查询） ,003: 数据生成（按关联号查询）,004: 查询（按关联号查询）
    PageNo: 1, //页号 NUMBER(8) F
    AcctId: zeroBlanceAcctId, //零余额账号 varChar(32) F
    BeginDate: null, //起始日期 varChar(8) F YYYYMMDD
    EndDate: null, //终止日期 varChar(8) F YYYYMMDD
    BudgetType: "3"  //预算来源信息 varChar(1) F 1:当年预算2:上年结余3:全部
};

txCode = "6WY101";//一点接入活期账户明细查询（报文）
txInfo = {
    ACCNO1: zeroBlanceAcctId, //账号 varChar(32) F
    STARTDATE: null, //开始时间 YYYYMMDD F
    ENDDATE: null, //结束时间 YYYYMMDD F
    BARGAIN_FLAG: null, //交易方向 Char(1) T
    CHECK_ACC_NO: null, //对方账户 varChar(32) T 0-借 转出 ,1-贷 转入
    CHECK_ACC_NAME: null, //对方账户名称 varChar(60) T
    REMARK: null, //备注 varChar(99) T
    LOW_AMT: null, //最小金额 Decimal(16,2) T
    HIGH_AMT: null, //最大金额 Decimal(16,2) T
    PAGE: null, //起始页 Int T 查询页次，整数>0
    POSTSTR: null, //定位串 varChar(100) T
    TOTAL_RECORD: null, //每页记录数 Int T 默认为10，大于0小于等于200，后续查询时的输入值，必须与首次查询设定的值相等
    DET_NO: null  //起始明细号 Int T 此明细号用于快速查询某条记录以后的明细数据(可参考返回报文DET_NO填写此值)
};

const beginDate = "20170501";
const endDate = "20170531";
new TaskQueryAllPages({txCode, txInfo, beginDate, endDate, debug}).execute()
    .then(results => {
        results.forEach(result => {
            console.log(JSON.stringify(result));
        });
        console.log("results.length=" + results.length);
    });