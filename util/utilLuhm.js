//Luhm校验规则：16位银行卡号（19位通用）:

// 1.将未带校验位的 15（或18）位卡号从右依次编号 1 到 15（18），位于奇数位号上的数字乘以 2。
// 2.将奇位乘积的个十位全部相加，再加上所有偶数位上的数字。
// 3.将加和加上校验位能被 10 整除。
"use strict";

//console.log(calcLuhm("628366010546651"));
//console.log(cardNoValid("6283660105466516"));

function calcLuhm(cardNoForCalc) {
  var luhm, i, val, valx2, digit, sum = 0, pos = 1;
  for (i = cardNoForCalc.length - 1; i > -1; i--) {    //前15或18位倒序存进数组
    digit = cardNoForCalc.substr(i, 1);
    val = parseInt(digit);
    if (pos % 2 == 1) {//奇数位
      valx2 = val * 2;
      if (valx2 < 9)
        sum += valx2;
      else {
        val = valx2 % 10;
        sum += val;
        sum += (valx2 - val) / 10;
      }
    } else //偶数位
      sum += val;
    pos++;
  }

  //计算Luhm值
  luhm = sum % 10;
  if (luhm !== 0)
    luhm = 10 - luhm;
  return luhm.toString();
}

function cardIdValid(cardNo) {
  var luhmDigit = cardNo.slice(-1), cardNoForCalc = cardNo.slice(0, -1);
  return luhmDigit === calcLuhm(cardNoForCalc);
}

/*
 function calcLuhmDetail(cardNoForCalc) {
 var allDigits = [];
 var i, val, valx2;
 for (i = cardNoForCalc.length - 1; i > -1; i--) {    //前15或18位倒序存进数组
 allDigits.push(cardNoForCalc.substr(i, 1));
 }
 var oddSmallNums = [];  //奇数位*2的积 <9
 var oddLargeCount = 0; //奇数位*2的积 >9
 var oddLarge1Nums = [];//奇数位*2 >9 的分割之后的数组十位数
 var oddLarge2Nums = [];//奇数位*2 >9 的分割之后的数组个位数
 var evenNums = [];  //偶数位数组
 for (i = 0; i < allDigits.length; i++) {
 val = parseInt(allDigits[i]);
 valx2 = val * 2;
 if ((i + 1) % 2 == 1) {//奇数位
 if (valx2 < 9)
 oddSmallNums.push(valx2);
 else {
 oddLargeCount++;
 oddLarge1Nums.push(valx2 / 10);
 oddLarge2Nums.push(valx2 % 10);
 }
 } else //偶数位
 evenNums.push(val);
 }

 var sumOddSmall = 0; //奇数位*2 < 9 的数组之和
 for (i = 0; i < oddSmallNums.length; i++) {
 sumOddSmall += oddSmallNums[i];
 }
 var sumOddLarge1 = 0; //奇数位*2 >9 的分割之后的数组十位数之和
 var sumOddLarge2 = 0; //奇数位*2 >9 的分割之后的数组个位数之和
 for (i = 0; i < oddLargeCount; i++) {
 sumOddLarge1 += oddLarge1Nums[i];
 sumOddLarge2 += oddLarge2Nums[i];
 }
 var sumEven = 0; //偶数位数组之和
 for (i = 0; i < evenNums.length; i++) {
 sumEven += evenNums[i];
 }


 //计算总和
 var sumTotal = sumOddSmall + sumOddLarge1 + sumOddLarge2 + sumEven;

 //计算Luhm值
 var luhm = sumTotal % 10;
 if (luhm !== 0)
 luhm = 10 - luhm;
 return luhm.toString();
 }
 */

module.exports = {
  calcLuhm,
  cardIdValid
};