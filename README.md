# Tumaini Financial Tracker

A comprehensive web-based financial management system designed for healthcare organizations to track income, expenses, and generate insightful financial reports with interactive visualizations.

##  Features

### Core Functionality
- **Transaction Management**: Add, edit, and delete financial transactions
- **Categorized Tracking**: Separate income and expense categories
- **Real-time Updates**: Instant calculation of financial summaries
- **Data Persistence**: JSON Server backend for reliable data storage

### Financial Insights
- **Financial Overview**: Real-time calculation of total income, expenses, and net profit
- **Interactive Charts**: 
  - Monthly income vs expense bar chart
  - Expense breakdown pie chart by category
- **Visual Feedback**: Color-coded financial indicators

### User Experience
- **Responsive Design**: Mobile-friendly interface
- **Smooth Navigation**: Sticky navigation with smooth scrolling
- **Interactive Alerts**: SweetAlert2 integration for confirmations
- **Custom Notifications**: Success toast messages for delete function

##  Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js for data visualization
- **Alerts**: SweetAlert2 for user interactions
- **Backend**: JSON Server (RESTful API)
- **Styling**: Custom CSS with modern design principles

##  Project Structure

```
tumaini-financial-tracker/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Main stylesheet
├── src/
│   └── index.js           # Main JavaScript file
├── images/
│   ├── tumaini.png        # Hero background image
│   └── input1.png         # Form section image
└── db.json                # JSON Server database file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:michaelfuchaka/Capstone-Project-Tumaini-Health-System.git
   cd tumaini-financial-tracker
   ```

2. **Install JSON Server globally**
   ```bash
   npm install -g json-server
   ```

4. **Start JSON Server**
   ```bash
   json-server --watch db.json 
   ```

5. **Open the application**
   Open `index.html` in your web browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

### API Endpoints

The application connects to JSON Server at `http://localhost:3000` with the following endpoints:

- `GET /transactions` - Fetch all transactions
- `POST /transactions` - Create new transaction
- `PUT /transactions/:id` - Update existing transaction
- `DELETE /transactions/:id` - Delete transaction

##  Transaction Categories

### Income Categories
- **Sales**: Revenue from services/products
- **Donations**: Charitable contributions
- **Grants**: Government or foundation funding

### Expense Categories
- **HR**: Human resources and payroll
- **Admin**: Administrative expenses
- **Supplies**: Medical and office supplies
- **Taxes**: Tax obligations

##  User Interface

### Navigation Sections
1. **Home**: Welcome page with hero image
2. **Input**: Transaction entry form
3. **Transaction List**: Tabular view of all transactions
4. **Financial Overview**: Summary and charts

### Key Components

#### Transaction Form
- Description input field
- Amount input (numeric)
- Type selector (Income/Expense)
- Dynamic category dropdown
- Date picker
- Submit/Update button

#### Transaction Table
- Sortable columns
- Edit/Delete action buttons
- Responsive design
- Real-time updates

#### Financial Dashboard
- Total Income display
- Total Expenses display
- Net Profit calculation
- Color-coded indicators

#### Data Visualizations
- **Bar Chart**: Monthly income vs expenses comparison
- **Pie Chart**: Expense breakdown by category with percentages

##  Configuration

### Customizing Categories
To modify transaction categories, update the arrays in `src/index.js`:

```javascript
const incomeCategories = ["Sales", "Donations", "Grants"];
const expenseCategories = ["HR", "Admin", "Supplies", "Taxes"];
```

### Styling Customization
Main CSS variables and colors can be modified in `css/style.css`:
- Primary color: `#007bff`
- Success color: `#28a745`
- Danger color: `#dc3545`
- Warning color: `#ffc107`

##  Responsive Design

The application is fully responsive with breakpoints at:
- Mobile: `max-width: 600px`
- Tablet: `max-width: 768px`
- Desktop: `min-width: 769px`

##  Security Features

- Input validation for all form fields
- Confirmation dialogs for destructive actions
- XSS protection through proper data handling
- Secure API communication

##  Status Indicators

- **Green**: Positive financial indicators (income, profit)
- **Red**: Negative financial indicators (expenses, losses)
- **Blue**: Neutral information and primary actions
- **Yellow**: Edit actions and warnings

## Chart Features

### Bar Chart
- Monthly income vs expense comparison
- Responsive design
- Hover interactions
- Automatic scaling

### Pie Chart
- Expense category breakdown
- Percentage labels
- Color-coded segments
- Interactive legend

## Data Flow

1. User inputs transaction data
2. Form validation ensures data integrity
3. POST request sent to JSON Server
4. Database updated with new transaction
5. UI refreshes with updated data
6. Charts and summaries recalculated
7. Visual feedback provided to user

##  Troubleshooting

### Common Issues

**JSON Server not connecting**
- Ensure JSON Server is running on port 3000
- Check if `db.json` file exists and is properly formatted
- Verify no other service is using port 3000

**Charts not displaying**
- Confirm Chart.js CDN is accessible
- Check browser console for JavaScript errors
- Ensure canvas elements have proper IDs

**Responsive issues**
- Clear browser cache
- Check viewport meta tag in HTML
- Verify CSS media queries

## Future Enhancements

- User authentication system
- Export functionality (PDF, Excel)
- Advanced filtering and search
- Budget planning features
- Multi-currency support
- Audit trail and transaction history
- Email notifications and reports
- Mobile app version

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Michael Fuchaka** - Initial work and ongoing maintenance

##  Support

For support and questions:
- Create an issue in the repository
- Contact [fuchakamichael06@gmail.com](mailto:fuchakamichael06@gmail.com)
- Check the troubleshooting section above

---

**Tumaini Financial Tracker** - Empowering healthcare organizations with comprehensive financial management tools.