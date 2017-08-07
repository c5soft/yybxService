"use strict";
const db = require("../util/utilDatabaseMSSql");

function matchId(source, re, snWidth = 4) {
  let id = "";
  const match = source.match(re);
  if (match) {
    id = match[1] || match[2];
    if (id.length <= snWidth) {
      id = "0".repeat(snWidth - id.length) + id;
      const d = new Date().toLocaleDateString("chinese", {year: "2-digit", month: "2-digit"});
      id = d.slice(0, 2) + d.slice(3, 5) + id;
    }
  }
  return id;
}

//收入申报
function matchPHNumber(flatArgs) {
  return matchId(flatArgs.swhere, /\+(\d+)|ph(\d+)/i);
}

function makePHVoucher(ph) {
  const sql = `DECLARE @批次 VARCHAR(10)=?,@凭证类型 VARCHAR(10)='02',@消息 VARCHAR(80)=NULL,@返回文本 BIT=0
     EXEC PH_MakeVoucher @批次 ,@凭证类型,@消息  OUTPUT,@返回文本
     SELECT @消息 消息`;
  const params = [ph];
  return db.execute(sql, params, db.dbSecondary);
}

function changePHStatus(ph, status) {
  const s = status.zt === "3" ? "制单" : "凭证删除";
  const sql = `DECLARE @批次 VARCHAR(10)=?,@状态 VARCHAR(10)=?,@消息 VARCHAR(80)
  EXEC PH_UpdateBatchStatus @批次,@状态, @消息 OUTPUT
  SELECT @消息 消息`;
  const params = [ph, s];
  return db.execute(sql, params, db.dbSecondary);
}

//保险
function matchBXNumber(flatArgs) {
  return matchId(flatArgs.swhere, /bx(\d+)/i);
}

function makeBXVoucher(ph) {
  const sql = `DECLARE @批次 VARCHAR(10)=?,@日期 VARCHAR(10)=NULL,@凭证类型 VARCHAR(10)='02',@消息 VARCHAR(80)=NULL,@返回文本 BIT=0
     EXEC PH_Trans51Voucher @批次 ,@日期,@凭证类型,@返回文本`;
  const params = [ph];
  return db.execute(sql, params, db.dbSecondary);
}

function changeBXStatus(bx, status) {
  const pznm = status.kjnd + status.kjqj + status.pzlx + status.pzbh;
  const s = status.zt === "3" ? "制单" : "凭证删除";
  const sql = `DECLARE @批次 VARCHAR(10)=?,@状态 VARCHAR(10)=?,@消息 VARCHAR(80)=?
  EXEC PH_UpdateTrans51Status @批次,@状态, @消息 OUTPUT
  SELECT @消息 消息`;
  const params = [bx, s, pznm];
  return db.execute(sql, params, db.dbSecondary);
}

//电费
function matchDFNumber(flatArgs) {
  return matchId(flatArgs.swhere, /df(\d+)/i, 2);
}

function makeDFVoucher(dfNum) {
  const sql = `DECLARE @合并单号 VARCHAR(10)=?,@凭证类型 VARCHAR(10)='12',@消息 VARCHAR(80)=NULL,@返回文本 BIT=0
     EXEC TM_MakeMergeVoucher @合并单号 ,@凭证类型,@消息  OUTPUT,@返回文本
     SELECT @消息 消息`;
  const params = [dfNum];
  return db.execute(sql, params, db.dbPrimary);
}

function changeDFStatus(dfNum, status) {
  const pznm = status.kjnd + status.kjqj + status.pzlx + status.pzbh;
  const sm = status.zt === "3" ? "报销成功" : "凭证删除";
  const sql = `DECLARE @合并单号 VARCHAR(10)=?,@状态 VARCHAR(10)=?,@消息 VARCHAR(80)=?,@凭证内码 VARCHAR(20)=?
  EXEC TM_ChangeMergeStatus @合并单号,@状态, @消息 OUTPUT,@凭证内码
  SELECT @消息 消息`;
  const params = [dfNum, status.zt, sm, pznm];
  return db.execute(sql, params, db.dbPrimary);
}


function matchVoucher(flatArgs) {
  let id, result = false;
  id = matchPHNumber(flatArgs);
  if (id)
    result = makePHVoucher(id);
  else {
    id = matchBXNumber(flatArgs);
    if (id)
      result = makeBXVoucher(id);
    else {
      id = matchDFNumber(flatArgs);
      if (id) {
        id = "DF" + id;
        result = makeDFVoucher(id);
      }
    }
  }
  return result;
}

function changeBatchStatus(flatArgs) {
  let result = false;
  if (/^PH/i.test(flatArgs.yydh))
    result = changePHStatus(flatArgs.yydh.slice(2), flatArgs);
  else if (/^BX/i.test(flatArgs.yydh))
    result = changeBXStatus(flatArgs.yydh.slice(2), flatArgs);
  else if (/^DF/i.test(flatArgs.yydh))
    result = changeDFStatus(flatArgs.yydh, flatArgs);
  return result;
}

module.exports = {
  matchVoucher, changeBatchStatus
};
