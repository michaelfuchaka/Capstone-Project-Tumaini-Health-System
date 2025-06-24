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
