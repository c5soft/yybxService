"use strict";

//const soap = require("strong-soap").soap;
const soap = require("strong-soap").soap;
const config = require("../config");
const intfPayHelper = require("./intfPayHelper");
const remoteUrl = config.yybxServiceUrl;
const port = config.http.port;
const options = {timeout: 60000, connection: "keep-alive", time: true};
const utilSoap = require("../util/utilSoap");
const path = require("path");
const monitor = true;
const yybxService = {
    // "input": {  "swhere": "s:string"   }
    GetPzfl: function (args, callback) {
        const flatArgs = utilSoap.flatArgs(args);
        if (monitor) console.log(JSON.stringify(flatArgs, 0, 2));
        const promise = intfPayHelper.matchVoucher(flatArgs);
        if (promise) {
            //if (monitor) console.log(ph);
            promise.then(results => {
                if (monitor) console.log(JSON.stringify(results[0], 0, 2));
                callback({
                    "GetPzflResult": {
                        "model_yy_pzfl": results[0]
                    }
                });
            }).catch(err => {
                callback(err);
                console.log(err);
            });
        } else {
            if (monitor) console.log(JSON.stringify(args, 0, 2));
            soap.createClient(remoteUrl, function (err, client) {
                client.GetPzfl(args, function (err, result) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    } else {
                        callback(result);
                        if (monitor) console.log(JSON.stringify(result, 0, 2));
                    }
                }, options);
            });
        }
    },
    //"input": {    "yydh": "s:string",   "zt": "s:string",    "kjnd": "s:string",   "kjqj": "s:string",   "pzlx": "s:string",   "pzbh": "s:string",   "sm": "s:string" }
    SetPzflZt: function (args, callback) {
        const flatArgs = utilSoap.flatArgs(args);
        const promise = intfPayHelper.changeBatchStatus(flatArgs);
        if (promise) {
            promise.then(result => {
                callback({"SetPzflZtResult": result});
            }).catch(err => {
                callback({"SetPzflZtResult": err});
            });
        } else {
            if (monitor) console.log(JSON.stringify(flatArgs, 0, 2));
            soap.createClient(remoteUrl, function (err, client) {
                client.SetPzflZt(args, function (err, result) {
                    if (err) {
                        callback(err);
                        if (monitor) console.log(err);
                    } else {
                        callback(result);
                        if (monitor) console.log(JSON.stringify(result, 0, 2));
                    }
                }, options);
            });
        }
    },
    //"input": { "kjnd": "s:string", "kjqj": "s:string", "pzlx": "s:string", "pzbh": "s:string",  "zt": "s:string" }
    ErasePzflZt: function (args, callback) {
        const flatArgs = utilSoap.flatArgs(args);
        const forward = true;
        if (forward) {
            if (monitor) console.log(JSON.stringify(flatArgs, 0, 2));
            soap.createClient(remoteUrl, function (err, client) {
                client.ErasePzflZt(args, function (err, result) {
                    if (err) {
                        callback(err);
                        if (monitor) console.log(err);
                    } else {
                        callback(result);
                        if (monitor) console.log(JSON.stringify(result, 0, 2));
                    }
                }, options);
            });
        } else
            callback({
                "ErasePzflZtResult": "s:string"
            });
    },
    //"input": { "yydh": "s:string"  }
    GetGwkxfjl: function (args, callback) {
        const flatArgs = utilSoap.flatArgs(args);
        const forward = true;
        if (forward) {
            if (monitor) console.log(JSON.stringify(flatArgs, 0, 2));
            soap.createClient(remoteUrl, function (err, client) {
                client.GetGwkxfjl(args, function (err, result) {
                    if (err) {
                        callback(err);
                        if (monitor) console.log(err);
                    } else {
                        callback(result);
                        if (monitor) console.log(JSON.stringify(result, 0, 2));
                    }
                }, options);
            });
        } else
            callback({
                "GetGwkxfjlResult": {
                    "module_yy_gwkxfjlb": [
                        {
                            "YYDH": "s:string",
                            "YWBH": "s:string",
                            "BMBH": "s:string",
                            "XMBH": "s:string",
                            "KMBH": "s:string",
                            "COLLECT_DATE": "s:string",
                            "CARD_ID": "s:string",
                            "BRANCH_NUM": "s:string",
                            "TXN_DT": "s:string",
                            "TXN_TIME": "s:string",
                            "PTG_DT": "s:string",
                            "TXN_DES": "s:string",
                            "MER_ID": "s:string",
                            "AMT_POS_TML_ID": "s:string",
                            "MER_NAME": "s:string",
                            "TXN_SEQ_NUM": "s:string",
                            "TXN_AMT": "s:decimal",
                            "TXN_CURR_CD": "s:string",
                            "TXN_ID": "s:string",
                            "ATH_CD": "s:string",
                            "SLT_ORG_ID": "s:string",
                            "PTG_ORG_ID": "s:string",
                            "SEARCH_REF_NUM": "s:string",
                            "SLT_DT": "s:string",
                            "JDBZ": "s:string",
                            "WBJE": "s:decimal",
                            "BZDM": "s:string",
                            "CKRXM": "s:string",
                            "YHBZ": "s:string",
                            "BZ": "s:string",
                            "CF1": "s:string",
                            "CF2": "s:string",
                            "CF3": "s:string",
                            "CF4": "s:string",
                            "CF5": "s:string",
                            "CF6": "s:string",
                            "GKYSLXDM": "s:string",
                            "GKLKXDM": "s:string",
                            "GKJJFLDM": "s:string",
                            "GKZCLXDM": "s:string",
                            "GKFZDM": "s:string",
                            "GKYSSXDM": "s:string",
                            "targetNSAlias": "tns",
                            "targetNamespace": "http://tempuri.org/"
                        }],
                    "targetNSAlias": "tns",
                    "targetNamespace": "http://tempuri.org/"
                }
            });
    },
    //"input": {   "ywbh": "s:string",    "zt": "s:string",    "zdr": "s:string",    "zwpznm": "s:string"  },
    SetXmzzxxZt: function (args, callback) {
        const flatArgs = utilSoap.flatArgs(args);
        const forward = true;
        if (forward) {
            if (monitor) console.log(JSON.stringify(flatArgs, 0, 2));
            soap.createClient(remoteUrl, function (err, client) {
                client.SetXmzzxxZt(args, function (err, result) {
                    if (err) {
                        callback(err);
                        if (monitor) console.log(err);
                    } else {
                        callback(result);
                        if (monitor) console.log(JSON.stringify(result, 0, 2));
                    }
                }, options);
            });
        }else
            callback({
                "SetXmzzxxZtResult": "s:boolean"
            });
    }
};
const services = {
    YybxService: {
        YybxServiceSoap: yybxService
    }
};
const wsdl = require("fs").readFileSync(path.join(__dirname, "yybxService.wsdl"), "utf8");

module.exports = {
    soap,
    services,
    wsdl,
    port
};

