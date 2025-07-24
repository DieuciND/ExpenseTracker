// Expense Tracker App

// State: Transactions array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let initialBudget = localStorage.getItem('initialBudget') ? parseFloat(localStorage.getItem('initialBudget')) : null;

// DOM Elements
const balance = document.getElementById('balance');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const budgetSetup = document.getElementById('budget-setup');
const budgetInput = document.getElementById('initial-budget');
const setBudgetBtn = document.getElementById('set-budget-btn');
const budgetDisplay = document.getElementById('budget-display');
const budgetAmount = document.getElementById('budget-amount');
let editBudgetBtn = null;
let addBudgetBtn = null;
const searchBar = document.getElementById('search-bar');
let searchQuery = '';
// Add reference to zero-budget checkbox
const zeroBudgetCheckbox = document.getElementById('zero-budget-checkbox');

function formatCurrency(amount) {
  return amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Add transaction to DOM list
function addTransactionDOM(transaction) {
  if (searchQuery && !transaction.text.toLowerCase().includes(searchQuery.toLowerCase())) {
    return;
  }
  const item = document.createElement('li');
  item.classList.add('minus');
  item.innerHTML = `
    ${transaction.text} <span>-R${formatCurrency(Math.abs(transaction.amount))}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;
  list.appendChild(item);
}

// Update the balance, income, and expense
function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);
  const totalExpense = (amounts.reduce((acc, item) => acc + item, 0) * -1);
  let currentBalance = 0;
  if (initialBudget !== null) {
    currentBalance = (initialBudget + amounts.reduce((acc, item) => acc + item, 0));
  }
  balance.innerText = initialBudget !== null ? `R${formatCurrency(currentBalance)}` : 'R0.00';
  money_minus.innerText = `-R${formatCurrency(totalExpense)}`;
  if (initialBudget !== null) {
    budgetAmount.innerText = `R${formatCurrency(initialBudget)}`;
  }
}

// Remove transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  updateLocalStorage();
  init();
}
window.removeTransaction = removeTransaction;

// Update localStorage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function showBudgetSetup(editing = false) {
  budgetSetup.style.display = 'flex';
  budgetDisplay.style.display = 'none';
  form.style.display = 'none';
  if (editing && initialBudget !== null) {
    budgetInput.value = initialBudget;
  } else {
    budgetInput.value = '';
  }
}

function hideBudgetSetup() {
  budgetSetup.style.display = 'none';
  budgetDisplay.style.display = 'block';
  form.style.display = '';
}

// Init app
function init() {
  if (initialBudget !== null) {
    hideBudgetSetup();
  } else {
    showBudgetSetup();
  }
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
  // Attach edit budget button event
  editBudgetBtn = document.getElementById('edit-budget-btn');
  if (editBudgetBtn) {
    editBudgetBtn.onclick = function() {
      showBudgetSetup(true);
    };
  }
  // Attach add to budget button event
  addBudgetBtn = document.getElementById('add-budget-btn');
  if (addBudgetBtn) {
    addBudgetBtn.onclick = function() {
      const addAmount = prompt('Enter amount to add to your budget (R):');
      const value = parseFloat(addAmount);
      if (isNaN(value) || value <= 0) {
        alert('Please enter a valid amount greater than 0');
        return;
      }
      initialBudget += value;
      localStorage.setItem('initialBudget', initialBudget);
      updateValues();
    };
  }
  if (searchBar) {
    searchBar.addEventListener('input', function(e) {
      searchQuery = e.target.value;
      list.innerHTML = '';
      transactions.forEach(addTransactionDOM);
    });
  }
}

init();

// Handle budget setup
setBudgetBtn.addEventListener('click', function() {
  // If zero-budget checkbox is checked, set budget to 0
  if (zeroBudgetCheckbox && zeroBudgetCheckbox.checked) {
    initialBudget = 0;
    localStorage.setItem('initialBudget', initialBudget);
    budgetInput.value = '';
    hideBudgetSetup();
    updateValues();
    return;
  }
  const value = parseFloat(budgetInput.value);
  if (isNaN(value) || value <= 0) {
    alert('Please enter a valid initial budget');
    return;
  }
  initialBudget = value;
  localStorage.setItem('initialBudget', initialBudget);
  budgetInput.value = '';
  hideBudgetSetup();
  updateValues();
});

// Disable/enable budget input based on checkbox
if (zeroBudgetCheckbox) {
  zeroBudgetCheckbox.addEventListener('change', function() {
    if (zeroBudgetCheckbox.checked) {
      budgetInput.value = '';
      budgetInput.disabled = true;
    } else {
      budgetInput.disabled = false;
    }
  });
}

// Handle form submit
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (initialBudget === null) {
    alert('Please set your initial budget first.');
    return;
  }
  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please enter a description and amount');
    return;
  }
  const amt = parseFloat(amount.value);
  if (isNaN(amt) || amt <= 0) {
    alert('Please enter a valid expense amount greater than 0');
    return;
  }
  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: -Math.abs(amt)
  };
  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();
  updateLocalStorage();
  text.value = '';
  amount.value = '';
}); 