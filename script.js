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

// Display update:
function updateDisplay(value) {
  display.textContent = value.toString();
}

// Basic operations:
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
  if (b === 0) return 'Error: /0!';
  return a / b;
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

// Clear all:
function clearAll() {
  currentInput = '';
  previousInput = '';
  operator = null;
  shouldReset = false;
  pendingScientificFunc = null;
  updateDisplay(0);
}

// Append number:
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

// Set operator:
function setOperator(op) {
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

// Calculate result:
function calculate() {
  if (pendingScientificFunc && currentInput !== '') {
    applyScientificFunction(pendingScientificFunc);
    return;
  }

  if (operator === null || currentInput === '' || previousInput === '')
    return;

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

// Backspace:
function backspace() {
  if (shouldReset) return;
  currentInput = currentInput.slice(0, -1);
  if (currentInput === '') {
    currentInput = '0';
  }
  updateDisplay(currentInput);
}

// Apply scientific function:
function applyScientificFunction(func) {
  let value = parseFloat(currentInput || display.textContent);
  let result;

  switch (func) {
    case 'sin':
      result = Math.sin(value * Math.PI / 180); break;
    case 'cos':
      result = Math.cos(value * Math.PI / 180); break;
    case 'tan':
      result = Math.tan(value * Math.PI / 180); break;
    case '√':
      result = Math.sqrt(value); break;
    case 'x²':
      result = Math.pow(value, 2); break;
    case 'log':
      result = Math.log10(value); break;
    default:
      return;
  }

  result = Math.round(result * 1e10) / 1e10;
  let expression = `${func}(${value}) = ${result}`;
  updateDisplay(expression);
  currentInput = result.toString();
  pendingScientificFunc = null;
  shouldReset = true;
}

// Bind scientific buttons:
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

// Handle normal button clicks:
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
