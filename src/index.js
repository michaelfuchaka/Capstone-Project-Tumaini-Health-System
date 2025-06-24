function renderTransactions() {
  // clear existing list before loop
  document.getElementById("transactionList").innerHTML = "";

  // Fetch transactions from json-server
  fetch("http://localhost:3000/transactions")
    .then((res) => res.json())
    .then((transactions) => {
      // Loop through each transaction in the transaction array
      transactions.forEach((transaction) => {
        // creating new div
        const item = document.createElement("div");
        item.className = "transaction";

        // HTML content inside new div
        item.innerHTML = `
    <p>${transaction.description} - KES ${transaction.amount}</p>
  <p>Type: ${transaction.type} | Category: ${transaction.category} | Date: ${transaction.date}</p>
  <button data-id="${transaction.id}" class="edit-btn"  >Edit</button>
  <button  data-id="${transaction.id}" class="delete-btn" >Delete</button>
    `;
        // Appending item to the list
        document.getElementById("transactionList").appendChild(item);
      });
      attachDeleteListeners();
      attachEditListeners();
      calculateSummary(transactions);
      generateBarChart(transactions);
      renderLineChart(transactions);
      drawExpensePieChart(transactions);

    });
}

// Selecting HTML List div
const form = document.getElementById("transactionForm");

// This listens to the submit form when user clicks add trasnaction button
form.addEventListener("submit", (e) => {
  // Prevents page reloads
  e.preventDefault();

  // prevvent double submit
  if (currentUpdateHandler) return;

  // Getting values from input
  const description = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  //  Validate the values
  if (!description || !amount || !type || !category || !date) {
    alert("Please fill all fields correctly.");
    return;
  }

  // creating New transaction object
  const newTransaction = { description, amount, type, category, date };

  // sending new transaction to json-server using post request
  fetch("http://localhost:3000/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTransaction),
  })
    .then((res) => res.json())
    .then((data) => {
      renderTransactions(); // Show updated list
      form.reset(); // Clear input form
    })
    .catch((error) => console.error("Error adding transaction:", error));

});
// Updating the category option drop down based on selected transaction type
const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");

//  Defining  categories
const incomeCategories = ["Sales", "Donations", "Grants"];
const expenseCategories = ["HR", "Operations", "Supplies", "Taxes"];

//  Function to update category options
function populateCategories(type) {
  categorySelect.innerHTML = "";
  const categories = type === "income" ? incomeCategories : expenseCategories;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Initial load
populateCategories(typeSelect.value);

// Update categories when type changes
typeSelect.addEventListener("change", () => {
  populateCategories(typeSelect.value);
});


// Delete function
function attachDeleteListeners() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
      );
      // sending delete request to server
      if (confirmDelete) {
        fetch(`http://localhost:3000/transactions/${id}`, {
          method: "DELETE",
        })
          .then(() => renderTransactions())
          .catch((err) => console.error("Error deleting:", err));
      }
    });
  });
}

// Edit transaction with highlighting
let currentUpdateHandler = null;
function attachEditListeners() {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      fetch(`http://localhost:3000/transactions/${id}`)
        .then((res) => res.json())
        .then((transaction) => {
          // fill input form
          document.getElementById("description").value =
            transaction.description;
          document.getElementById("amount").value = transaction.amount;
          document.getElementById("type").value = transaction.type;
          document.querySelector("select:nth-of-type(2)").value =
            transaction.category;
          document.getElementById("date").value = transaction.date;

          // Scroll to top for user clarity
          window.scrollTo({ top: 0, behavior: "smooth" });

          // Change button text
          const submitButton = document.querySelector("button[type='submit']");
          submitButton.textContent = "Update Transaction";

          if (currentUpdateHandler) {
            form.removeEventListener("submit", currentUpdateHandler);
          }

          const updateHandler = (e) => {
            e.preventDefault();

            const updatedTransaction = {
              description: document.getElementById("description").value,
              amount: parseFloat(document.getElementById("amount").value),
              type: document.getElementById("type").value,
              category: document.getElementById("category").value,
              date: document.getElementById("date").value,
            };

            fetch(`http://localhost:3000/transactions/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedTransaction),
            }).then(() => {
              renderTransactions();
              form.reset();
              submitButton.textContent = "Add Transaction";
              form.removeEventListener("submit", updateHandler);
            });
          };

          form.addEventListener("submit", updateHandler);
          currentUpdateHandler = updateHandler;
        });
    });
  });
}

renderTransactions();
// financial overview display and net profit calculation
function calculateSummary(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalTaxes = 0;

  // looping through each transaction
  transactions.forEach((tnx) => {
    const amount = parseFloat(tnx.amount);

    if (tnx.type.toLowerCase().trim() === "income") {
      totalIncome += amount;
    } else if (tnx.type.toLowerCase().trim() === "expense") {
      totalExpenses += amount;
    }
  });
  const netProfit = totalIncome - totalExpenses;

  document.getElementById("total-income").textContent = totalIncome.toFixed(2);
  document.getElementById("total-expenses").textContent =
    totalExpenses.toFixed(2);
  document.getElementById("net-profit").textContent = netProfit.toFixed(2);
}

// Bar chart for monthly income vs expenses
function generateBarChart(transactions) {
  // storing monthly income and expense
  const monthlyIncome = {};
  const monthlyExpense = {};

  transactions.forEach((tnx) => {
    // converting date into javascript object
    const date = new Date(tnx.date);
    // creating a readable month string
    const month = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    }); // e.g., "Jun 2025"
    const amount = parseFloat(tnx.amount); //Ensuring amount is a number

    //  Checking if transaction is income or expense then add corresponding amount to it
    if (tnx.type.toLowerCase() === "income") {
      monthlyIncome[month] = (monthlyIncome[month] || 0) + amount; //check if the month already has a value, use it; otherwise, start from 0
    } else if (tnx.type.toLowerCase() === "expense") {
      monthlyExpense[month] = (monthlyExpense[month] || 0) + amount;
    }
  });
  // merging all month names from both monthlyIncome and monthlyExpense into a single list
  const months = Array.from( new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlyExpense)])
  ).sort();

  // creating arrays for income and expense values and defaulting monthly income /expense to 0 if it has no value
  const incomeData = months.map((m) => monthlyIncome[m] || 0);
  const expenseData = months.map((m) => monthlyExpense[m] || 0);

  // selecting the canvas id for bar chart
  const charttnx = document.getElementById("bar-chart").getContext("2d");
  if (window.barChart) window.barChart.destroy(); // Destroy previous chart to avoid duplication

  // Creating a bar chart
  window.barChart = new Chart(charttnx, {
    type: "bar",
    data: {
      // montyh names on the x-axis
      labels: months,
      // creating bars for each month
      datasets: [
        {
          label: "Income",
          backgroundColor: "green",
          data: incomeData,
        },
        {
          label: "Expenses",
          backgroundColor: "red",
          data: expenseData,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Monthly Income vs Expense", //Title
        },
      },
    },
  });
}

// Line chart for Financial Trend
function renderLineChart(transactions) {
  const labels = [];// dates
  const incomeTrend = [];
  const expenseTrend = [];

  // Group transactions by date
  const dailyTotals = {};

  // Looping through all transactions then add amount based on transaction type
  transactions.forEach((tnx) => {
    const date = tnx.date;
    const amount = parseFloat(tnx.amount);
//  checks if daily totals has date
    if (!dailyTotals[date]) {
      dailyTotals[date] = { income: 0, expense: 0 };
    }
   //Adding transaction amount to income or expense
    if (tnx.type.toLowerCase() === "income") {
      dailyTotals[date].income += amount;
    } else if (tnx.type.toLowerCase() === "expense") {
      dailyTotals[date].expense += amount;
    }
  });

  // Convert daily total to arrays for charts
  Object.entries(dailyTotals).forEach(([date, totals]) => {
    labels.push(date); //label get date

    //income and trend get totals for each day
    incomeTrend.push(totals.income);
    expenseTrend.push(totals.expense);
  });

  // Render chart
  new Chart(document.getElementById("line-chart"), {
    type: "line",
    data: {
      labels: labels, // X-axis dates
      datasets: [
        {
          label: "Income",  // Y-axis
          borderColor: "green",
          fill: false,
          data: incomeTrend,
        },
        {
          label: "Expenses",// Y-axis
          borderColor: "red",
          fill: false,
          data: expenseTrend,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Financial Trend Over Time",
        },
      },
    },
  });
}


// pie Chart for categories
function drawExpensePieChart(transactions) {
  const categoryTotals = {};

  transactions.forEach((tx) => {
    if (tx.type.toLowerCase() === "expense") {
      const category = tx.category;
      const amount = parseFloat(tx.amount);

      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += amount;
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const ctx = document.getElementById("pie-chart").getContext("2d");

  // Destroy existing chart if it exists
  if (window.pieChartInstance) {
    window.pieChartInstance.destroy();
  }

  window.pieChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Expense Breakdown by Category",
          data: data,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
        },
      ],
    },
  });
}
