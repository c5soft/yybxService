const db = require("../util/utilDatabaseMSSql");

const urUnknown = "urUnknown";

function login2(aId, aPwd) {
  return new Promise((resolve, reject) => {
    const sql = `DECLARE @用户名  VARCHAR(20)=?,@密码  VARCHAR(20)=?,@UserRole VARCHAR(20)
      EXEC PH_Login2 @用户名,@密码,@UserRole OUTPUT; SELECT @UserRole UserRole`;
    const params = [aId, aPwd];
    db.execute(sql, params, db.dbSecondary).then(
        results => {
          const userRole = results[results.length - 1].userRole;
          if (userRole === urUnknown) {
            reject("您提供的登录资料无法通过系统认证，请重新输入！");
          } else {
            resolve(results);
          }
        }
    );
  });
}
login2("89059", "1").
    then(r => console.dir(r)).
    catch(e => console.error(e));