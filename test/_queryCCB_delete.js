let {requestCCB, zeroBlanceAcctId} = require("../util/utilSocketCCB");
const Timer = require("../util/utilTimer");

let txCode, txInfo;

txCode = "6WB008";
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

txCode = "6WB007";
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

txCode = "6WB006";
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

const debug = false;
const preprocess = false;

const timer = new Timer();

async function queryCCB(txCode, txInfo, options = {}) {
    const taskSize = 20;
    const firstResult = await requestCCB(txCode, txInfo, {debug, preprocess});
    const finalResults = [];
    const pendings = [];
    let i, pendingIndex, taskCount, tasks;
    finalResults.push(...firstResult.TX_INFO.LIST);
    //result.TX_INFO.LIST = [];
    //console.log(JSON.stringify(result, 0, 2));
    const totalPage = parseInt(firstResult.TX_INFO.TotalPage);
    const totalRec = parseInt(firstResult.TX_INFO.TotalRec);
    const totalAmt = parseFloat(firstResult.TX_INFO.TotalTxAmount);
    console.log("total Page: " + totalPage);
    console.log("total Rec: " + totalRec);
    console.log("total Amt: " + totalAmt);
    for (i = 2; i <= totalPage; i++) pendings.push(i);
    pendingIndex = 0;
    tasks = [];
    taskCount = 0;
    while (pendingIndex < pendings.length) {
        const _txInfo = Object.assign({}, txInfo, {PageNo: pendings[pendingIndex]});
        tasks.push(requestCCB(txCode, _txInfo, {debug, preprocess}));
        pendingIndex++;
        taskCount++;
        if (taskCount === taskSize || pendingIndex === pendings.length) {
            const taskResults = await Promise.all(tasks);
            taskResults.forEach(taskResult => {
                if (taskResult.RETURN_CODE === "000000") {
                    finalResults.push(...taskResult.TX_INFO.LIST);
                    //console.log(JSON.stringify(taskResult.TX_INFO.PageNo));
                    if (debug) {
                        taskResult.TX_INFO.LIST = [];
                        console.log(JSON.stringify(taskResult.TX_INFO));
                    }
                } else {//出现意外，需要重新处理
                    pendings.push(parseInt(taskResult.TX_INFO.PageNo));
                    if (debug)
                        console.log(JSON.stringify(taskResult, 0, 2));
                }
            });
            tasks = [];
            taskCount = 0;
        }
    }
    return finalResults;
}

queryCCB(txCode, txInfo).then(result => {
    console.log("list.length=" + result.length);
    /*
    list.forEach((row,i)=>{
        console.log(i+" "+JSON.stringify(row));
    })
    */
    console.log("耗时：" + timer.elapsed());
});