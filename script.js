let currentInput = '';
let previousInput = '';
let operator = null;
let shouldReset = false;
let pendingScientificFunc = null;

const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

const toggleButton = document.getElementById("toggleScientific");
const sciButton = document.getElementById("scientificButtons");

toggleButton.addEventListener('click', () => {
  sciButton.style.display = sciButton.style.display === 'none' ? 'grid' : 'none';
});

function updateDisplay(value) {
  display.textContent = value.toString();
}

function add(a, b) {
   return a + b; 
  }
function subtract(a, b) {
   return a - b;
   }
function multiply(a, b) { 
  return a * b;
 }
function divide(a, b) { 
  return b === 0 ? 'Error: /0!' : a / b; 
}
function modulus(a, b) {
   return a % b;
   }

function operate(op, a, b) {
  a = parseFloat(a);
  b = parseFloat(b);
  switch (op) {
    case '+': return add(a, b);
    case '-': return subtract(a, b);
    case '*': return multiply(a, b);
    case '/': return divide(a, b);
    case '%': return modulus(a, b);
    default: return null;
  }
}

function clearAll() {
  currentInput = '';
  previousInput = '';
  operator = null;
  shouldReset = false;
  pendingScientificFunc = null;
  updateDisplay(0);
}

function appendNumber(num) {
  if (shouldReset) {
    currentInput = '';
    shouldReset = false;
  }
  if (num === '.' && currentInput.includes('.')) return;

  currentInput += num;

  if (pendingScientificFunc) {
    updateDisplay(`${pendingScientificFunc}(${currentInput})`);
  } else {
    updateDisplay(currentInput);
  }
}

function setOperator(op) {
  if (pendingScientificFunc) {
    currentInput += op;
    updateDisplay(`${pendingScientificFunc}(${currentInput})`);
    return;
  }

  if (currentInput === '') return;
  if (previousInput !== '') {
    previousInput = operate(operator, previousInput, currentInput).toString();
    updateDisplay(previousInput);
  } else {
    previousInput = currentInput;
  }
  operator = op;
  currentInput = '';
}

function calculate() {
  if (pendingScientificFunc && currentInput !== '') {
    applyScientificFunction(pendingScientificFunc);
    return;
  }

  if (operator === null || currentInput === '' || previousInput === '') return;

  let result = operate(operator, previousInput, currentInput);
  if (typeof result === 'string' && result.includes('Error')) {
    updateDisplay(result);
  } else {
    result = Math.round(result * 1e10) / 1e10;
    updateDisplay(result);
    previousInput = result.toString();
  }

  currentInput = '';
  operator = null;
  shouldReset = true;
}

function backspace() {
  if (shouldReset) return;
  currentInput = currentInput.slice(0, -1);
  if (currentInput === '') {
    currentInput = '0';
  }

  if (pendingScientificFunc) {
    updateDisplay(`${pendingScientificFunc}(${currentInput})`);
  } else {
    updateDisplay(currentInput);
  }
}

function applyScientificFunction(func) {
  let inputExpr = currentInput || display.textContent;

  const match = inputExpr.match(/^[a-z]+\((.*)\)$/i);
  if (match) {
    inputExpr = match[1];
  }

  let value;
  try {
    value = eval(inputExpr);
  } catch {
    updateDisplay(`${func}(${inputExpr}) = Error`);
    currentInput = '';
    return;
  }

  let result;
  switch (func) {
    case 'sin': result = Math.sin(value * Math.PI / 180); 
    break;
    case 'cos': result = Math.cos(value * Math.PI / 180);
     break;
    case 'tan':
      const radians = value * Math.PI / 180;
      result = Math.abs(Math.cos(radians)) < 1e-10 ? Infinity : Math.tan(radians);
      break;
    case '√': result = value < 0 ? 'Error' : Math.sqrt(value);
     break;
    case 'x²': result = Math.pow(value, 2); 
    break;
    case 'log':
      if (value < 0) result = 'Error';
      else if (value === 0) result = -Infinity;
      else result = Math.log10(value);
      break;
    default: result = 'Error';
  }

  if (result === 'Error') {
    updateDisplay(`${func}(${inputExpr}) = Error`);
    currentInput = '';
  } else if (result === Infinity) {
    updateDisplay(`${func}(${inputExpr}) = ∞`);
    currentInput = result.toString();
  } else if (result === -Infinity) {
    updateDisplay(`${func}(${inputExpr}) = -∞`);
    currentInput = result.toString();
  } else {
    result = Math.round(result * 1e10) / 1e10;
    updateDisplay(`${func}(${inputExpr}) = ${result}`);
    currentInput = result.toString();
  }

  pendingScientificFunc = null;
}

document.querySelectorAll('.scientific').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!currentInput) {
      pendingScientificFunc = btn.textContent;
      updateDisplay(`${btn.textContent}(`);
    } else {
      applyScientificFunction(btn.textContent);
    }
  });
});

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.textContent.trim();

    if (!isNaN(value) || value === '.') {
      appendNumber(value);
    } else if (['+', '-', '*', '/', '%'].includes(value)) {
      setOperator(value);
    } else if (button.id === 'equals') {
      calculate();
    } else if (button.id === 'clear') {
      clearAll();
    } else if (button.id === 'backspace') {
      backspace();
    }
  });
});

