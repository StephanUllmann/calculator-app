"use strict";

///
/// Selecting DOM elements

const keypadEl = document.querySelector(".keypad");
const screenContent = document.querySelector(".screen__text");
const themeToggleEl = document.querySelector(".theme__form-group");

screenContent.textContent = "";

///
/// Key Map

const calculatorKeys = new Map([
  ["1", "1"],
  ["2", "2"],
  ["3", "3"],
  ["4", "4"],
  ["5", "5"],
  ["6", "6"],
  ["7", "7"],
  ["8", "8"],
  ["9", "9"],
  ["0", "0"],
  [".", "."],
  [",", "."],
  ["+", "+"],
  ["-", "-"],
  ["x", "x"],
  ["*", "x"],
  ["/", "/"],
  ["=", "="],
  ["Enter", "="],
  ["del", "del"],
  ["Backspace", "del"],
  ["reset", "reset"],
  ["Escape", "reset"],
  ["Delete", "reset"],
  ["ArrowUp", "up"],
]);

let values = [];
let curValue = "";
let lastCalculation = [];

///
/// Functions

const isDisplayingPrevRes = () =>
  typeof curValue !== "string" || curValue === "Division by 0";

const hasPoint = () => curValue.includes(".");
const possiblePoint = (key) => key === "." && !hasPoint();
const pointFirst = function () {
  if (isDisplayingPrevRes()) reset();
  if (curValue.length === 0) {
    screenContent.textContent += "0";
    curValue += "0";
  }
};

const concatKey = (key) => {
  if (isDisplayingPrevRes()) reset();
  if (curValue.at(0) === "0" && !hasPoint() && key !== ".") {
    screenContent.textContent = "";
    curValue = "";
  }
  if (isFinite(key) || possiblePoint(key)) {
    screenContent.textContent += key;
    curValue += key;
  }
};

const concatOperator = (key) => {
  if (screenContent.textContent.at(-1) === " ") return;
  if (values.at(-1) === "-" && !isFinite(curValue)) return;
  if (screenContent.textContent.length === 0) return;
  screenContent.textContent += ` ${key} `;
  values.push(curValue);
  values.push(key);
  curValue = "";
};

const reset = () => {
  screenContent.textContent = "";
  values.length = 0;
  curValue = "";
};

const deleteLast = () => {
  if (screenContent.textContent.at(-1) === " ") {
    screenContent.textContent = screenContent.textContent.slice(0, -3);
  } else {
    screenContent.textContent = screenContent.textContent.slice(0, -1);
    curValue = curValue.slice(0, -1);
  }
};

const concatZero = (key) => {
  if (curValue.at(0) !== "0" || hasPoint()) concatKey(key);
};

const concatNegative = (key) => {
  if (!curValue) {
    curValue += key;
    screenContent.textContent += key;
  } else {
    concatOperator(key);
  }
};

const displayError = function () {
  reset();
  screenContent.textContent = "Error";
};

const includesMultiplication = (arr) => arr.indexOf("x") > 0;
const includesDivision = (arr) => arr.indexOf("/") > 0;

const multiplicationFirst = (arr) => {
  if (includesMultiplication(arr)) {
    if (
      !includesDivision(arr) ||
      (includesDivision(arr) && arr.indexOf("x") < arr.indexOf("/"))
    )
      return true;
  } else false;
};

const divisionFirst = (arr) => {
  if (includesDivision(arr)) {
    if (
      !includesMultiplication(arr) ||
      (includesMultiplication(arr) && arr.indexOf("/") < arr.indexOf("x"))
    )
      return true;
  } else false;
};

const additionFirst = (arr) => arr.at(1) === "+";
const substractionFirst = (arr) => arr.at(1) === "-";

// const checkZeroDivision = (num) => {
//   if (num !== 0) return num;
//   else
// }

const multiplicate = (arr) => {
  const indexMul = arr.indexOf("x");
  if (arr.length === 3) {
    return [arr[0] * arr[2]];
  } else if (indexMul === 1) {
    return [arr[0] * arr[2], ...arr.slice(3, arr.length)];
  } else {
    return [
      ...arr.slice(0, indexMul - 1),
      arr[indexMul - 1] * arr[indexMul + 1],
      ...arr.slice(indexMul + 2, arr.length),
    ];
  }
};
const divide = (arr) => {
  const indexDiv = arr.indexOf("/");
  if (arr[indexDiv + 1] === 0) return ["Division by 0"];
  if (arr.length === 3) {
    return [arr[0] / arr[2]];
  } else if (indexDiv === 1) {
    return [arr[0] / arr[2], ...arr.slice(3, arr.length)];
  } else {
    return [
      ...arr.slice(0, indexDiv - 1),
      arr[indexDiv - 1] / arr[indexDiv + 1],
      ...arr.slice(indexDiv + 2, arr.length),
    ];
  }
};
const add = (arr) => [arr[0] + arr[2], ...arr.slice(3, arr.length)];
const subtract = (arr) => [arr[0] - arr[2], ...arr.slice(3, arr.length)];

const evaluate = function () {
  values.push(curValue);
  curValue = "";
  lastCalculation = [...values];
  let workingArr = values.map((val) => (isFinite(val) ? Number(val) : val));
  let counter = 1;
  while (workingArr.length > 1 && counter < 50) {
    counter = counter + 1;
    if (multiplicationFirst(workingArr)) {
      workingArr = multiplicate(workingArr);
      continue;
    }
    if (divisionFirst(workingArr)) {
      workingArr = divide(workingArr);
      continue;
    }
    if (additionFirst(workingArr)) {
      workingArr = add(workingArr);
      continue;
    }
    if (substractionFirst(workingArr)) workingArr = subtract(workingArr);
  }
  reset();
  curValue = workingArr[0];
  screenContent.textContent = String(curValue).slice(0, 20);
};

const displayLastCalc = function () {
  reset();
  values = [...lastCalculation];
  screenContent.textContent = values.join(" ");
};

const handleKeyPress = function (key) {
  switch (key) {
    case "reset":
      reset();
      break;
    case "del":
      deleteLast();
      break;
    case ".":
      pointFirst();
      concatKey(key);
      break;
    case "+":
    case "x":
    case "/":
      concatOperator(key);
      break;
    case "-":
      concatNegative(key);
      break;
    case "0":
      concatZero(key);
      break;
    case "=":
      evaluate();
      break;
    case "up":
      displayLastCalc();
      break;
    default:
      concatKey(key);
  }
};

const listenForKeyPress = function () {
  keypadEl.addEventListener("click", (e) => {
    const key = e.target.closest("div").dataset["val"];
    if (!key) return;
    handleKeyPress(key);
  });

  window.addEventListener("keydown", (e) => {
    const key = e.key;
    if (!calculatorKeys.has(key)) return;
    handleKeyPress(calculatorKeys.get(key));
    document
      .querySelector(`[data-val='${calculatorKeys.get(key)}']`)
      .classList.add("active");
  });

  window.addEventListener("keyup", (e) => {
    const key = e.key;
    if (!calculatorKeys.has(key)) return;
    document
      .querySelector(`[data-val='${calculatorKeys.get(key)}']`)
      .classList.remove("active");
  });
};

const checkSysTheme = function () {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)");
  if (isDark.matches) {
    document.body.classList.remove("theme--1");
    document.body.classList.remove("theme--2");
    document.body.classList.add("theme--3");

    document.getElementById(`rbtn-${themeNumber}`).checked = true;
  }
};

const listenForThemeToggle = function () {
  themeToggleEl.addEventListener("click", function (e) {
    const radioBtn = e.target.closest("input");
    if (!radioBtn) return;
    const themeNumber = radioBtn.value;
    document.body.classList.remove("theme--1");
    document.body.classList.remove("theme--2");
    document.body.classList.remove("theme--3");
    document.body.classList.add(`theme--${themeNumber}`);
  });
};

const init = function () {
  document.querySelector(".container").style.height = `${window.innerHeight}px`;

  listenForKeyPress();
  checkSysTheme();
  listenForThemeToggle();
};

init();
