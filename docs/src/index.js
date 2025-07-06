function renderTransactions() {
  // Clear and create table structure
  const container = document.getElementById("transactionList");
  container.innerHTML = `
    <table class="transaction-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount (KES)</th>
          <th>Type</th>
          <th>Category</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="transaction-table-body"></tbody>
    </table>
  `;

  // Fetch from JSON Server
  fetch("https://tumaini-backend-gxpa.onrender.com/transactions")
    .then((res) => res.json())
    .then((transactions) => {
      const tableBody = document.getElementById("transaction-table-body");

      transactions.forEach((transaction) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${transaction.description}</td>
          <td>${transaction.amount}</td>
          <td>${transaction.type}</td>
          <td>${transaction.category}</td>
          <td>${transaction.date}</td>
          <td>
            <button data-id="${transaction.id}" class="edit-btn">Edit</button>
            <button data-id="${transaction.id}" class="delete-btn">Delete</button>
          </td>
        `;

        tableBody.appendChild(row);
      });

      // Attach events and update data
      attachDeleteListeners();
      attachEditListeners();
      calculateSummary(transactions);
      generateBarChart(transactions);

      drawExpensePieChart(transactions);
    })
    .catch((error) => {
      console.error("Failed to fetch transactions:", error);
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
  fetch("https://tumaini-backend-gxpa.onrender.com/transactions", {
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
const expenseCategories = ["HR", "Admin", "Supplies", "Taxes"];

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

// Delete function and alerts
function attachDeleteListeners() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      // Use SweetAlert only for confirmation
      Swal.fire({
        title: "Are you sure?",
        text: "You won’t be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`https://tumaini-backend-gxpa.onrender.com/transactions/${id}`, {
            method: "DELETE",
          })
            .then(() => {
              // Show pop up
              const customToast = document.getElementById("custom-toast");
              customToast.style.display = "block";

              // Clear any previous timeout to avoid overlap
              if (window.toastTimeout) clearTimeout(window.toastTimeout);

              // Set a new 3-minute timeout
              window.toastTimeout = setTimeout(() => {
                customToast.style.display = "none";
                renderTransactions(); // Re-render only after toast disappears
              }, 3000); //
            })

            .catch((err) => {
              console.error("Error deleting:", err);

              Swal.fire({
                title: "Oops!",
                text: "Something went wrong. Please try again.",
                icon: "error",
              });
            });
        }
      });
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

      fetch(`https://tumaini-backend-gxpa.onrender.com/transactions/${id}`)
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
        document.getElementById("form-section").scrollIntoView({ behavior: "smooth" });

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

            fetch(`https://tumaini-backend-gxpa.onrender.com/transactions/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedTransaction),
            }).then(() => {
              renderTransactions();
              form.reset();
              submitButton.textContent = "Add Transaction";
              form.removeEventListener("submit", updateHandler);
              document.getElementById("list-section").scrollIntoView({behavior:"smooth"});
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
  const months = Array.from(
    new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlyExpense)])
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
      
    },
  });
}

// Expense pie chart
function drawExpensePieChart(transactions) {
  // Defining Categories
  const rawCategoryTotals = {
    HR: 0,
    Admin: 0,
    Supplies: 0,
    Taxes: 0,
  };

  //  loop through transaction and get Sum for each expense by category
  transactions.forEach((tnx) => {
    if (tnx.type.toLowerCase() === "expense") {
      const category = tnx.category;
      if (rawCategoryTotals.hasOwnProperty(category)) {
        rawCategoryTotals[category] += parseFloat(tnx.amount);
      }
    }
  });

  // Filter out categories with 0 amount
  const filteredEntries = Object.entries(rawCategoryTotals).filter(
    ([_, value]) => value > 0
  );

  //  Calculate totals with labels and percentage
  const total = filteredEntries.reduce((sum, [_, val]) => sum + val, 0);

  // Create labels (Taxes (50%))
  const labels = filteredEntries.map(([cat, val]) => {
    const percent = ((val / total) * 100).toFixed(1);
    return `${cat} (${percent}%)`;
  });

  const data = filteredEntries.map(([_, val]) => val);

  // Render the Pie Chart
  const ctx = document.getElementById("pie-chart").getContext("2d");

  //Prepares the chart area and ensures it clears the previous chart if it existed
  if (window.pieChartInstance) window.pieChartInstance.destroy();

  // Create new chart with chart.js
  window.pieChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Expense Breakdown",
          data: data,
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        },
      ],
    },
    options: {
      plugins: {
        
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

// Navbar responsiveness

function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('active');
  } else {
    console.error('navLinks element not found');
  }
}

function closeMenu() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.remove('active');
  } else {
    console.error('navLinks element not found');
  }
}

// // Admin authorise access
// document.querySelector('.cta-button').addEventListener('click', function (e) {
//   e.preventDefault(); // Prevent default anchor behavior

//   Swal.fire({
//     title: 'Admin Access Required',
//     input: 'password',
//     inputLabel: 'Enter Admin Password',
//     inputPlaceholder: 'Enter password',
//     showCancelButton: true,
//     confirmButtonText: 'Access',
//   }).then((result) => {
//     if (result.isConfirmed && result.value === 'admin123') {
//       // Grant access
//       document.querySelector('.main-layout').style.display = 'block';
//       document.querySelector('.nav-links li:nth-child(2)').style.display = 'list-item'; // Input
//       document.querySelector('.nav-links li:nth-child(3)').style.display = 'list-item'; // Transaction List
//       document.querySelector('.nav-links li:nth-child(4)').style.display = 'list-item'; // Financial Overview

// // Fetch and render charts + transactions
// fetch("https://tumaini-backend-gxpa.onrender.com/transactions")
//   .then((res) => res.json())
//   .then((transactions) => {
//     renderTransactions(); // Still needed for table
//     generateBarChart(transactions);
//     renderLineChart(transactions);
//     drawExpensePieChart(transactions);
//   });

// // Scroll to input section
// document.querySelector('#transactionForm').scrollIntoView({ behavior: 'smooth' });

//       //  Scroll smoothly to input section
//       document.querySelector('#transactionForm').scrollIntoView({ behavior: 'smooth' });
//     } else if (result.isConfirmed) {
//       Swal.fire('Access Denied', 'Incorrect admin password.', 'error');
//     }
//   });
// });

// // Hide protected sections on page load
// document.addEventListener('DOMContentLoaded', () => {
//   document.querySelector('.main-layout').style.display = 'none';
//   document.querySelector('.nav-links li:nth-child(2)').style.display = 'none'; // Input
//   document.querySelector('.nav-links li:nth-child(3)').style.display = 'none'; // Transaction List
//   document.querySelector('.nav-links li:nth-child(4)').style.display = 'none'; // Financial Overview
// });
