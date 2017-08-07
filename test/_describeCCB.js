const PromiseX = require("bluebird");
const fs = require("fs");
const cheerio = require('cheerio');
const Iconv = require("iconv").Iconv;
const fromGBK = new Iconv("GBK", "UTF-8").convert;
const readFile = PromiseX.promisify(fs.readFile);
const readDir = PromiseX.promisify(fs.readdir);
const path = "D:\\信息科\\接口\\外联平台20170721\\P1新对公网银_外联平台企业开发接口_V8.0_20170527\\Source";


function table2json(html, trimTailEmpty) {
    const $ = cheerio.load(html);
    const result = [];
    // Fetch each row
    $("tr").each((trIndex, row) => {
        let rowAsJson = [];
        $("td", $(row)).each((tdIndex, cell) => {
            rowAsJson.push($(cell).text().trim());
        });
        if (trimTailEmpty) {
            if (rowAsJson[0] === "<<返回分类目录")
                rowAsJson = [];
            else {
                let p = rowAsJson.length - 1;
                while (p >= 0)
                    if (rowAsJson[p].length === 0) p--; else break;
                if (p >= 0)
                    rowAsJson = rowAsJson.slice(0, p + 1);
                else
                    rowAsJson = [];
            }
        }
        // Skip blank rows
        if (rowAsJson.length > 0) result.push(rowAsJson);
    });
    return result;
}


async function buildParams(path, txCode) {
    const html = fromGBK(await readFile(path + "\\" + txCode + ".html")).toString();
    const rows = table2json(html, true);
    const txReqHead = [], txReqBody = [], txResHead = [], txResBody = [], txResBodyList = [];
    let readReqHead = false, readReqBody = false, readResHead = false, readResBody = false, readResBodyList = false;
    let i = 0, mark, a = false;
    while (i < rows.length) {
        mark = rows[i][0];
        if (mark === "Transaction_Header") {
            if (!readReqHead) {
                a = txReqHead;
                readReqHead = true;
            } else if (!readResHead) {
                a = txResHead;
                readResHead = true;
            }
            i++;
        } else if (mark === "Transaction_Body") {
            if (!readReqBody) {
                a = txReqBody;
                readReqBody = true;
            } else if (!readResBody) {
                a = txResBody;
                readResBody = true;
            }
            i++;
        } else if (mark === "LIST（多条记录）") {
            if (!readResBodyList) {
                a = txResBodyList;
                readResBodyList = true;
            }
        }
        if (i < rows.length) {
            mark = rows[i][0];
            if (parseInt(mark) > 0 && typeof a === "object")
                a.push(rows[i]);
            i++;
        }
    }
    const txName = rows[1][1];
    const txType = rows[2][3];
    const sqlType = (t) => {
        let result = t;
        if (result === "NUMBER(18,2)")
            result = "MONEY";
        return result.toUpperCase();
    };
    const txResBodyListMetaSQL = function () {
        const tableName = "伴侣网银" + this.txCode;
        const prefix = " ".repeat(2), owner = "dbo";
        let insertFlds = `INSERT INTO ${tableName}(`;
        let createTable = `IF NOT EXISTS(SELECT 1 FROM sysobjects WHERE name='${tableName}' AND type='U' AND uid=user_id('${owner}'))\n  CREATE TABLE ${owner}.${tableName}(\n`;
        createTable += prefix + "操作员 VARCHAR(10) NOT NULL,\n";
        this.txResBodyList.forEach((row, i) => {
            insertFlds += row[2] + (i === this.txResBodyList.length - 1 ? ")" : ",");
            createTable += prefix + row[2] + " " + sqlType(row[3]) + (row[4] === "F" ? " NOT NULL" : " NULL") + (i === this.txResBodyList.length - 1 ? "\n)" : ",\n");
        });
        return {createTable, insertFlds};
    };
    const describe = function () {
        const metaSQL = this.txResBodyListMetaSQL();
        let result = "";
        result += "{\n";
        const prefix = " ".repeat(2);
        result += prefix + "txCode: \"" + this.txCode + "\",//" + this.txName + "\n";
        result += prefix + "txInfo: {\n";
        this.txReqBody.forEach((row, i) => {
            const coma = (i === this.txReqBody.length - 1) ? " " : ",";
            result += prefix.repeat(2) + row[1] + ": null" + coma + " //" + row[2] + " " + row[3] + " " + row[4] + " " + (row[5] ? row[5].replace(/\n {4}/g, ",") : "") + "\n";
        });
        result += prefix + "}\n";
        result += "}\n";
        result += metaSQL.createTable + "\n";
        result += metaSQL.insertFlds;
        console.log(result);
    };

    const display = function () {
        let result = "";
        const displayArray = (a, title) => {
            const prefix = " ".repeat(2);
            result += title + ":\n";
            a.forEach(row => {
                result += prefix + JSON.stringify(row, 0, 0) + "\n";
            });
        };
        result += "txCode:" + this.txCode + "\n";
        result += "txName:" + this.txName + "\n";
        result += "txType:" + this.txType + "\n";
        displayArray(this.txReqHead, "txReqHead");
        displayArray(this.txReqBody, "txReqBody");
        displayArray(this.txResHead, "txResHead");
        displayArray(this.txResBody, "txResBody");
        displayArray(this.txResBodyList, "txResBodyList");
        console.log(result);
    };
    return {
        txCode,
        txName,
        txType,
        txReqHead,
        txReqBody,
        txResHead,
        txResBody,
        txResBodyList,
        txResBodyListMetaSQL,
        display,
        describe
    };
}

async function list(path) {
    const files = (await readDir(path)).sort();
    const results = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.length === 11) {
            //console.log(JSON.stringify(file, 0, 0));
            const txCode = file.slice(0, 6);
            const txInfo = await   buildParams(path, txCode);
            /*
            let headInfo = "";
            txInfo.txResHead.forEach(row => {
                headInfo += row[1] + "-";
            });
            //"REQUEST_SN-CUST_ID-USER_ID-PASSWORD-TX_CODE-LANGUAGE-"
            //"REQUEST_SN-CUST_ID-TX_CODE-RETURN_CODE-RETURN_MSG-LANGUAGE-"
            */
            results.push(txInfo);
        }
    }
    return results;
}

/*
list(path).then(results => {
    results.forEach(result => {
        console.log(result.txCode + " " + result.txName);
    });
});
*/
//buildParams(path, "6WB006").then(result => result.display());
buildParams(path, "6WB006").then(result => result.describe());
//buildParams(path, "6WY101").then(result => result.describe());