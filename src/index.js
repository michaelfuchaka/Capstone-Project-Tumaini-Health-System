// Loop through each transaction in the transaction array
transactions.forEach((transaction) => {

  // creating new div
  const item = document.createElement("div");
  item.className = "transaction";
  
  // HTML content inside new div
  item.innerHTML = `
    <p>${transaction.description} - KES ${transaction.amount}</p>
  <p>Type: ${transaction.type} | Category: ${transaction.category} | Date: ${transaction.date}</p>
  <button>Edit</button>
  <button>Delete</button>
    `;
    // Appending item 
    document.getElementById("transactionList").appendChild(item);
});
