"use strict";
const crypto = require("crypto");
const config = require("../config");
const db = require("msnodesqlv8");

function execute(sql, params, cnStr = config.cnStr(), raw = false) {
  //cnStr = cnStr || config.cnStr();
  return new Promise((resolve, reject) => {
    db.open({conn_str: cnStr, conn_timeout: config.timeOut.dbConnect}, function(err, cn) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        const queryRawOrObj = raw ? cn.queryRaw : cn.query;
        const results = [];
        queryRawOrObj({query_str: sql, query_timeout: config.timeOut.dbQuery}, params, function(err, result, more) {
          if (err) {
            if (err.code === 0 && err.sqlstate === "01000") {//SQL PRINT
              console.log(err.message);
            } else
              reject(err);
          } else {
            if ((raw && result.meta) || (result && result.length > 0))
              results.push(result);
            if (!more) {
              cn.close();
              resolve(results);
            }
          }
        });
      }
    });
  });
}
function executeRaw(sql, params, cnStr) {
  return execute(sql, params, cnStr, true);
}

function rawFlat(raw) {
  return raw.rows.map(o => o[0]);
}

function fxNameMaker(fld, i) {
  return "f" + i.toString(26);
}

/// Convert msnodesqlv8 raw to  ExtJs store/grid metaData
function rawCook(raw, opts = {}, rawResults = {}) {
  const {widthMaker, nameMaker, typeMaker, rowCalculator, resultModifier, hasColumns = true, hasFields = true} = opts;
  const fldNameMaker = nameMaker || ( (fld, i, meta) => fld.name);
  const fldTypeMaker = typeMaker ||
      ((fld, i, meta) => fld.type === "text" ? "string" : fld.type);
  const rawMeta = raw && raw.meta || [];
  const rows = raw && raw.rows || [];
  const fields = [], columns = [];
  //const toolkit = raw.toolkit || "modern";
  if (hasFields || hasColumns)
    rawMeta.forEach((fld, i) => {
      if (hasFields) {
        fld.fldName = fldNameMaker(fld, i, rawMeta);
        fld.fldType = fldTypeMaker(fld, i, rawMeta);
        fld.sqlName = fld.name;
        fields.push({
          name: fld.fldName,
          type: fld.fldType,
          mapping: i,
          sqlName: fld.sqlName,
          sqlType: fld.sqlType
        });
      }
      if (hasColumns) {
        const column = {
          text: fld.name,
          dataIndex: fld.fldName,
          menuDisabled: true,
          sortable: false
        };
        if (fld.sqlType === "money") {
          column.xtype = "numbercolumn";
          column.align = "right";
        }
        if (widthMaker) {
          column.width = widthMaker(fld, i, rawMeta);
        }
        columns.push(column);
      }
    });
  if (rowCalculator)
    rows.forEach((row, i, rawMeta) => {
      rowCalculator(row, i, rawMeta);
    });
  const getColumn = function(dataIndex) {
    return (typeof dataIndex === "number") ?
        this.metaData.columns[dataIndex] :
        this.metaData.columns.find(c => c.dataIndex === dataIndex);
  };
  const setColRender = function(dataIndex, renderer) {
    const column = this.getColumn(dataIndex);
    if (column) {
      delete column.xtype;
      column.renderer = renderer;
    }
  };
  const setColText = function(dataIndex, text) {
    const column = this.getColumn(dataIndex);
    if (column) {
      column.text = text;
    }
  };
  const getColText = function(dataIndex) {
    const column = this.getColumn(dataIndex);
    let result;
    if (column) {
      result = column.text;
    }
    return result;
  };
  const metaData = {rootProperty: "rows"};
  if (hasColumns) metaData.columns = columns;
  if (hasFields) metaData.fields = fields;
  const result = Object.assign({metaData, rows},
      hasColumns ? {setColRender, setColText, getColText, getColumn} : {});
  if (resultModifier) resultModifier(result, rawResults);
  return result;
}

function executeCount(sql, params, cnStr) {
  const hash = crypto.createHash("sha256");
  const sqlp = sql + JSON.stringify(params);
  hash.update(sqlp);
  const cacheKey = hash.digest("hex");
  const cacheSql = `DECLARE @ckey VARCHAR(64),@cval BIGINT=NULL
      SET @ckey=? 
      EXEC dbo.spc5countCacheGet @ckey,  @cval OUTPUT
      SELECT @cval cval`;
  const cacheParams = [cacheKey];
  return new Promise((resolve, reject) => {
    executeRaw(cacheSql, cacheParams, cnStr).then(
        cacheResults => {
          const cacheCount = cacheResults[0].rows[0][0];
          if (cacheCount === null) {
            executeRaw(sql, params, cnStr).then(
                results => {
                  const count = results[0] && results[0].rows[0] && results[0].rows[0][0];
                  resolve(count);
                  if (count !== null) {
                    const cacheSql = `DECLARE @ckey VARCHAR(64),@cval BIGINT=NULL
                                                  SELECT @ckey=?,@cval=? 
                                                  EXEC dbo.spc5countCacheSet @ckey, @cval
                                                  SELECT @cval cval`;
                    const cacheParams = [cacheKey, count];
                    executeRaw(cacheSql, cacheParams, cnStr).catch(reason => {
                      console.log("countCacheSet Err:" + reason);
                    });
                  }
                }).catch(reason => reject(reason));
          } else
            resolve(cacheCount);
        }
    ).catch(reason => reject(reason));
  });
}

function executeSql(o) {
  return new Promise((resolve, reject) => {
    const where = o.where ? " WHERE " + o.where : "";
    const sqlC = o.sqlC || o.sql || o.from && "SELECT COUNT(*) cnt " + " FROM " + o.from + where || "";
    const hasCount = o.hasCount || o.paramsC;
    const paramsC = o.paramsC || o.params || [];
    //console.log(sqlC);
    //console.log(sqlD, o.params);
    //console.log("hasCount",hasCount);
    const promiseCount = hasCount ? executeCount(sqlC, paramsC, o.cnStr) : Promise.resolve(0);
    promiseCount.then(totalCount => {
      if (o.detailSumRows) {
        if (o.detailSumRows >= totalCount)
          if (o.paramsD) o.paramsD[o.paramsD.length - 1] = true;
      }
      const groupBy = o.groupBy ? " GROUP BY " + o.groupBy : "";
      const orderBy = o.orderBy ? " ORDER BY " + o.orderBy : "";
      const paging = o.limit ? (o.orderBy ? ` OFFSET ${o.start} ROWS FETCH NEXT ${o.limit} ROWS ONLY` : "") : "";
      const sqlD = o.sqlD || o.sql ||
          o.from && "SELECT " + o.select + " FROM " + o.from + where + groupBy + orderBy + paging || "";
      const paramsD = o.paramsD || o.params || [];
      executeRaw(sqlD, paramsD, o.cnStr).
          then(results => {
            const result = rawCook(results[0], o, results);
            if (hasCount) {
              result.metaData.totalProperty = "totalCount";
              result.totalCount = totalCount;
            }
            resolve(result);
          }).
          catch(reason => reject(reason));
    }).catch(reason => reject(reason));
  });
}

function saveRecords(options) {
  let {cnStr, records, table, idFld = "id", operation = "SAVE", insertIncludeKey = true} = options;
  if (!Array.isArray(records))
    records = [records];
  return new Promise((resolve, reject) => {
    const actions = [];
    records.forEach(record => {
      let sql, insFlds = "", insVals = "", updSets = "";
      const id = record.id;
      const values = [];

      if (operation === "SAVE") {
        const keys = Object.keys(record).filter(k => k !== "id");
        keys.forEach(k => {
          insFlds += k + ",";
          insVals += "?,";
          updSets += k + "=?,";
          values.push(record[k]);
        });
        insFlds = insFlds.slice(0, -1);
        insVals = insVals.slice(0, -1);
        updSets = updSets.slice(0, -1);
        if (insertIncludeKey) {
          insFlds += "," + idFld;
          insVals += ",?";
        }
      }

      const params = [];

      if (operation === "SAVE") {
        sql = `IF EXISTS(SELECT 1 FROM ${table} WHERE ${idFld}=?) 
        UPDATE ${table} SET ${updSets} WHERE ${idFld}=?
        ELSE  INSERT INTO ${table}(${insFlds}) VALUES(${insVals})`;
        params.push(id, ...values, id, ...values);
        if (insertIncludeKey) {
          params.push(id);
        }
      } else {
        sql = `DELETE ${table} WHERE ${idFld}=?`;
        params.push(id);
      }
      //console.log(sql, params);
      //actions.push({sql, params,cnStr});
      actions.push(executeRaw(sql, params, cnStr));
    });
    Promise.all(actions).then(results => resolve({success: true})).catch(err => reject(err));
  });
}
function deleteRecords(options) {
  options.operation = "DELETE";
  return saveRecords(options);
}

module.exports = {
  dbPrimary: config.cnStr("dbPrimary"),
  dbSecondary: config.cnStr("dbSecondary"),
  execute,
  executeRaw,
  executeSql,
  saveRecords,
  deleteRecords,
  rawFlat,
  rawCook,
  fxNameMaker
};
