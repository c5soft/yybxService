const {requestCCB, zeroBlanceAcctId} = require("../util/utilSocketCCB");
const db = require("../util/utilDatabaseMSSql");
const {cardIdValid} = require("../util/utilLuhm");
const Timer = require("../util/utilTimer");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class TaskBaseCCB {
    constructor(options = {}) {
        this.options = Object.assign({progress: true}, options);
        this.pendings = [];
        this.finalResults = [];
        this.zeroBlanceAcctId = zeroBlanceAcctId;
    }

    async preparePendings() {
        this.pendings = [];
    }

    makeTask(pending) {
        return {};
    }

    processTaskResult(taskResult, pending) {
        const ok = taskResult.ok;
        if (ok)
            this.finalResults.push(pending);
        else
            this.pendings.push(pending);
    }

    async execute(taskSize = 20) {
        let pendingIndex = 0;
        this.finalResults = [];
        await this.preparePendings();
        let taskCount = 0;
        let tasks = [];
        let taskPendings = [];
        const timer = new Timer();
        if (this.options.progress)
            console.log(new Date().toLocaleTimeString() + " 开始 ...");
        while (pendingIndex < this.pendings.length) {
            const pending = this.pendings[pendingIndex];
            taskPendings.push(pending);
            tasks.push(this.makeTask(pending));
            pendingIndex++;
            taskCount++;
            if (taskCount === taskSize || pendingIndex === this.pendings.length) {
                const taskResults = await  Promise.all(tasks);
                taskResults.forEach((taskResult, i) => {
                    const pending = taskPendings[i];
                    this.processTaskResult(taskResult, pending);
                });
                if (this.options.progress)
                    console.log(new Date().toLocaleTimeString() + " 已处理 " + (pendingIndex / this.pendings.length * 100).toFixed(0) + "% ...");
                taskCount = 0;
                tasks = [];
                taskPendings = [];
            }
        }
        if (this.options.progress)
            console.log("耗时: " + timer.elapsed());
        return this.finalResults;
    }
}

//options.:{txCode,txInfo,beginDate,endDate} required
class TaskQueryAllPages extends TaskBaseCCB {
    constructor(options = {}) {
        super(options);
        if (options.debug) {
            console.log("beginDate:" + this.options.beginDate);
            console.log("endDate:" + this.options.endDate);
            console.log("txCode:" + this.options.txCode);
            console.log("txInfo:" + JSON.stringify(this.options.txInfo, 0, 2));
        }
    }

    makeTXInfo(pageNo) {
        if (this.options.txCode === "6WY101") {
            const STARTDATE = this.options.beginDate;
            const ENDDATE = this.options.endDate;
            const PAGE = pageNo;
            const TOTAL_RECORD = 100;
            return Object.assign({}, this.options.txInfo, {STARTDATE, ENDDATE, PAGE, TOTAL_RECORD});
        } else {
            const BeginDate = this.options.beginDate;
            const EndDate = this.options.endDate;
            const PageNo = pageNo;
            return Object.assign({}, this.options.txInfo, {BeginDate, EndDate, PageNo});
        }
    }

    async preparePendings() {
        const txInfo = this.makeTXInfo(1);
        const firstResult = await requestCCB(this.options.txCode, txInfo);
        if (firstResult.RETURN_CODE === "000000") {
            let i, totalPage = parseInt(firstResult.TX_INFO.TotalPage);
            this.pendings = [];
            this.finalResults = [];
            this.finalResults.push(...firstResult.TX_INFO.LIST);
            for (i = 2; i <= totalPage; i++) this.pendings.push(i);
            this.totalPage = totalPage;
            this.totalRec = parseInt(firstResult.TX_INFO.TotalRec);
            this.totalAmt = parseFloat(firstResult.TX_INFO.TotalTxAmount);
        } else {
            console.log(JSON.stringify(firstResult));
            throw "无法与建行前置机通讯";
        }
    }

    makeTask(pending) {
        const txInfo = this.makeTXInfo(pending);
        return requestCCB(this.options.txCode, txInfo);
    }

    processTaskResult(taskResult, pending) {
        if (taskResult.RETURN_CODE === "000000") {
            this.finalResults.push(...taskResult.TX_INFO.LIST);
            if (this.options.debug) {
                taskResult.TX_INFO.LIST = [];
                console.log(JSON.stringify(taskResult.TX_INFO));
            }
        } else {//出现意外，需要重新处理
            const pageNo = parseInt(taskResult.TX_INFO.PageNo);
            this.pendings.push(pageNo);
            if (this.options.debug) {
                if (pageNo !== pending)
                    console.log("pageNo(" + pageNo + ")!==pending(" + pending + ")");
                console.log(JSON.stringify(taskResult, 0, 2));
            }
        }
    }
}

//options:{checkId}
class TaskCheckGWK extends TaskBaseCCB {

    constructor(options = {}) {
        super(options);
        if (this.options.debug) {
            console.log("checkId:" + this.options.checkId);
        }
    }

    async preparePendings() {
        this.pendings = (await  db.execute(`select z.ygbh staffId, z.ygmc name,z.sfzh id,z.gwkh cardNo,b.bmbh+' '+b.bmmc dept,z.mobie mobile
                  from zwzgzd z join zwbmzd b on z.bmbh=b.bmbh where z.gwkh>'' order by z.bmbh,z.ygbh`, [], db.dbPrimary))[0];
    }

    makeTask(pending) {
        if (!cardIdValid(pending.cardNo)) {
            return Promise.resolve({bug: "卡号有误"});
        } else {
            const txCode = "6WB101";
            const txInfo = {
                FuncCode: "000",//功能代码 varChar(3) F 000：查询
                PageNo: 1,//页号 NUMBER(8) F
                AssignAcctId: zeroBlanceAcctId,//零余额账号 varChar(32) F
                CardId: pending.cardNo,//公务卡号 varChar(32) T
                CardName: null,//持卡人姓名 varChar(20) T
                IdType: "100",//证件类型 varChar(3) T 户口簿:130 军官证:112 警官证:122 居民身份证:100 其它证件（个人）:199 士兵证:111 外国护照:142 武警士兵证:121 武警文职干部证:123 文职干部证:113 中国护照:141
                IdCode: null//"6283660105840355"//"110108196611059378" //证件号码 varChar(20) T
            };
            return requestCCB(txCode, txInfo);
        }
    }

    processTaskResult(taskResult, pending) {
        if (taskResult.bug) {
            pending.bug = taskResult.bug;
            this.finalResults.push(pending);
        } else if (taskResult.RETURN_CODE === "000000") {
            let bug = false;
            if (parseInt(taskResult.TX_INFO.RecCount) === 0) {
                bug = "+卡未登记";
            } else if (taskResult.TX_INFO.LIST.CardName !== pending.name) {
                bug = "*姓名不符【" + taskResult.TX_INFO.LIST.CardName + "】";
            } else if (this.options.checkId && taskResult.TX_INFO.LIST.IdCode !== pending.id) {
                bug = "*身份证不符【" + taskResult.TX_INFO.LIST.IdCode + "】";
            }
            if (bug) {
                pending.bug = bug;
                this.finalResults.push(pending);
            }
        } else {//出现意外，需要重新处理
            this.pendings.push(pending);
            if (this.options.debug) {
                console.log("出现意外，需要重新处理:");
                console.log(JSON.stringify(taskResult));
            }
        }
    }
}


module.exports = {
    zeroBlanceAcctId,
    TaskBaseCCB,
    TaskCheckGWK,
    TaskQueryAllPages
};

