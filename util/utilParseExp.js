"use strict";
const cstParseBetween = "-";
const cstParseAnd = "+";
const pftStr = "str";
const pftNum = "num";
const pftDate = "date";

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength,padString) {
    targetLength >>= 0; //floor if number or convert non-number to 0;
    padString = String(padString || ' ');
    if (this.length > targetLength) {
      return String(this);
    }
    else {
      targetLength = targetLength-this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0,targetLength) + String(this);
    }
  };
}

function doublePercent(AInfo) {
  return AInfo.replace(/%/g, "%%");
}

function quotedStr(AVal) {
  return "'" + AVal.replace(/'/g, "''") + "'";
}

function relationSignLen(AVal) {
  let result = 0, cVal1, cVal2;
  cVal1 = AVal.charAt(0);
  if ((cVal1 === ">") || (cVal1 === "<") || (cVal1 === "=") || (cVal1 === "!")) {
    cVal2 = AVal.charAt(1);
    if (cVal2 === "=")
      result = 2;
    else if ((cVal1 === "<") && (cVal2 === ">"))
      result = 2;
    else if (cVal1 !== "!")
      result = 1;
  }
  return result;
}

function parseStr(AVal, AFld, AFldLen = 0, APadLeft = "\0") {
  let cVal1, cVal2, cValx, i, j, result;
  i = AVal.indexOf(cstParseBetween);
  if (i >= 0) {
    cVal1 = AVal.slice(0, i).trim();
    cVal2 = AVal.slice(i + 1).trim();
    if (APadLeft === "\0") {
      i = cVal1.length;
      if (i < cVal2.length) i = cVal2.length;
      result = "SUBSTRING(" + AFld + ",1," + i + ") BETWEEN " +
          quotedStr(cVal1) + " AND " + quotedStr(cVal2);
    } else if (AFldLen > 0) {
      cVal1 = cVal1.padStart(AFldLen, APadLeft);
      cVal2 = cVal2.padStart(AFldLen, APadLeft);
      result = AFld + " BETWEEN " + quotedStr(cVal1) + " AND " + quotedStr(cVal2);
    }
  } else {
    i = relationSignLen(AVal);
    if (i > 0) {
      cVal1 = AVal.slice(0, i);
      cVal2 = AVal.slice(i);
      result = AFld + cVal1 + quotedStr(cVal2);
    } else {
      if (AVal.includes("?") || AVal.includes("*")) {
        cVal2 = AVal;
        cVal2 = cVal2.replace(/\?/g, "_");
        cVal2 = cVal2.replace(/\*/g, "%");
        result = AFld + " LIKE " + quotedStr(cVal2);
      } else if (APadLeft === "\0") {
        if (AFldLen === 0) {
          cValx = AVal;
          j = cValx.indexOf(cstParseAnd);
          if (j === 0)
            result = AFld + " LIKE " + quotedStr("%" + doublePercent(cValx) + "%");
          else {
            result = "";
            while (j > 0) {
              cVal1 = cValx.slice(0, j).trim();
              if (cVal1.length > 0) {
                if (result.length > 0) result += " AND ";
                result += AFld + " LIKE " +
                    quotedStr("%" + doublePercent(cVal1) + "%");
              }
              cValx = cValx.slice(j + 1).trim();
              j = cValx.indexOf(cstParseAnd);
            }
            if (cValx.length > 0) {
              if (result.length > 0) result = result + " AND ";
              result = result + AFld + " LIKE " +
                  quotedStr("%" + doublePercent(cValx) + "%");
            }
          }
        } else if (AVal.length < AFldLen)
          result = AFld + " LIKE " + quotedStr(doublePercent(AVal) + "%");
        else {
          cVal1 = "=";
          cVal2 = AVal;
          result = AFld + cVal1 + quotedStr(cVal2);
        }
      } else {
        cVal1 = "=";
        cVal2 = AVal.padStart(AFldLen, APadLeft);
        result = AFld + cVal1 + quotedStr(cVal2);
      }
    }
  }
  return result;
}

function parseNum(AVal, AFld) {
  let cVal1, cVal2, i, result;
  i = relationSignLen(AVal);
  if (i > 0) {
    cVal1 = AVal.slice(0, i);
    cVal2 = AVal.slice(i);
    result = AFld + cVal1 + cVal2;
  } else {
    i = AVal.indexOf(cstParseBetween);
    if (i > 0) {
      cVal1 = AVal.slice(0, i).trim();
      cVal2 = AVal.slice(i+1).trim();
      result = AFld + " BETWEEN " + cVal1 + " AND " + cVal2;
    }
    else {
      result = AFld + "=" + AVal;
    }
  }
  return result;
}

function parseDate(AVal, AFld, AFldLen) {
  let cVal1, cVal2, i, result;
  i = relationSignLen(AVal);
  if (i > 0) {
    cVal1 = AVal.slice(0, i);
    cVal2 = AVal.slice(i);
    result = AFld + cVal1 + quotedStr(cVal2);
  } else {
    i = AVal.indexOf(cstParseBetween);
    if (i > 0) {
      cVal1 = AVal.slice(0, i).trim();
      cVal2 = AVal.slice(i+1).trim();
      result = AFld + " BETWEEN " + quotedStr(cVal1) + " AND " + quotedStr(cVal2);
    } else {
      if (AVal.length < AFldLen)
        result = AFld + " LIKE " + quotedStr(AVal + "%");
      else
        result = AFld + "=" + quotedStr(AVal);
    }
  }
  return result;
}

function parseExp(AExp, AFld, AFldType = pftStr, AFldLen = 0, APadLeft = "\0") {
  let codes, i, result, fnParse;
  if (AExp === "为空") {
    if (AFldType === pftStr)
      result = "LEN(ISNULL(" + AFld + ",''))=0";
    else
      result = AFld + " IS NULL";
  } else {
    codes = AExp.split(",").filter(x => x.length > 0);
    if (AFldType === pftStr)
      fnParse = parseStr;
    else if (AFldType === pftNum)
      fnParse = parseNum;
    else if (AFldType === pftDate)
      fnParse = parseDate;
    if (codes.length === 1) {
      result = fnParse(codes[0], AFld, AFldLen, APadLeft);
    } else if (codes.length > 1) {
      result = "";
      for (i = 0; i < codes.length; i++)
        result += " OR " + fnParse(codes[i], AFld, AFldLen, APadLeft);
      result = "(" + result.slice(4) + ")";
    }
  }
  return result;
}

module.exports = {
  pftStr, pftNum, pftDate,
  parseExp
};
