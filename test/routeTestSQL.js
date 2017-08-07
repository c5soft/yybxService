"use strict";
//const connStr = new Buffer(JSON.parse( "[68,114,105,118,101,114,61,123,83,81,76,32,83,101,114,118,101,114,32,78,97,116,105,118,101,32,67,108,105,101,110,116,32,49,49,46,48,125,59,83,101,114,118,101,114,61,99,119,99,46,99,97,117,46,101,100,117,46,99,110,59,85,73,68,61,80,97,121,72,101,108,112,101,114,95,65,117,116,111,85,115,101,114,59,80,87,68,61,70,86,54,22,15,77,15,59,68,97,116,97,98,97,115,101,61,123,80,97,121,72,101,108,112,101,114,125,59]")).toString();
//console.dir(connStr);
const db = require("../util/utilDatabaseMSSql");

/*
//const sql = "select 5 cnt;SELECT TOP 5 * FROM dbo.zwzgzd where ygmc like ?";
const sql = `DECLARE @计算方法 VARCHAR(10),@应发 MONEY,@实发 MONEY,@个税 MONEY,@税率 MONEY
  SELECT @应发=?
  EXEC PayHelper.dbo.spTaxCalcTool "薪酬正算",@应发 OUTPUT,@实发 OUTPUT,@个税 OUTPUT,@税率 OUTPUT
  SELECT @应发 AS 应发,@实发 AS 实发,@个税 AS 个税,@税率 AS 税率`;
const params = [80000];
db.execute(sql, params, db.dbSecondary).
    then(results => console.dir(results)).
    catch(reason => console.error(reason));
*/

module.exports = function(request, response) {
  const sql = "SELECT TOP 5 * FROM dbo.zwzgzd where ygmc like ?";
  const params = ["肖%"];
  db.execute(sql, params).
      then(results => {
        response.setHeader("Content-Type", "application/json;charset=utf-8");
        response.write(JSON.stringify(results));
        response.end();
      }).catch(reason => response.end(reason));
};
