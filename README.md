# Bamazon

### Overview

Bamazon is an Amazon-like storefront that runs in the terminal with node and utilizes a mySQL database to store information. The app can take in orders from customers and depete stock from the store's inventory.

----------

### Installation Guide

- Clone or fork the repository to your local machine. From there you will want to use your favorite Terminal Emulator to cd into the folder and run `npm install` to install all the npm packages from the `package.json` file.

- You will then want to fire up your MySQL Workbench or whatever application you use to manage SQL databases and run the script in the `Bamazon.sql` file. This will create the database and tables for the Bamazon application.

 - Lastly, make sure that the connection in each file (pictured below) has the port, username, and password that match your mySQL settings.
~~~~
var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "",
    database: "Bamazon",
    multipleStatements: true
});
~~~~~

--------

### Challenge #1: Customer View (Minimum Requirement)

- To run the customer view, cd into the folder that you forked/cloned from github.
- After double checking that you have all the packages needed installed by running `npm install`, you can run `node BamazonCustomer.js` to run the customer view.
- You will be able to see what is in stock and purchase items. You will also be able to edit your cart before you decide to checkout. 
- One you checkout, your local `Bamazon` database will be updated to reflect the new inventory counts.
- Below is a video of the customer view in action.

**** customer view video coming soon ****

--------

### Challenge #2: Manager View (Next Level)

- To run the manager view, cd into the folder that you forked/cloned from github.
- After double checking that you have all the packages needed installed by running `npm install`, you can run `node BamazonManager.js` to run the customer view.
- You will be able to see all the items in the database.
- You can also add inventory to an item or add a new item which will also add the item to the local `Bamazon` SQL database.
- Below is a video of the manager view in action.

**** manager view video coming soon ****

--------

### Challenge #3: Executive View (Final Level)

**** executive view not completed yet ****

1. Create a new MySQL table called `Departments`. Your table should include the following columns:

	* DepartmentID

	* DepartmentName

	* OverHeadCosts (A dummy number you set for each department)

	* TotalSales

2. Modify your `BamazonCustomer.js` app so that when a customer purchases anything from the store, the program will calculate the total sales from each transaction.
	* Add the revenue from each transaction to the `TotalSales` column for the related department.
	* Make sure your app still updates the inventory listed in the `Products` column.

3. Create another Node app called `BamazonExecutive.js`. Running this application will list a set of menu options: 
	* View Product Sales by Department 
	* Create New Department

4. When an executive selects `View Product Sales by Department`, the app should display a summarized table in their terminal/bash window. Use the table below as a guide. 

	| DepartmentID | DepartmentName | OverHeadCosts | ProductSales | TotalProfit |
	|--------------|----------------|---------------|--------------|-------------|
	| 01           | Electronics    | 10000         | 20000        | 10000       |
	| 02           | Clothing       | 60000         | 100000       | 40000       |


5. The `TotalProfit` should be calculated on the fly using the difference between `OverheadCosts` and `ProductSales`. `TotalProfit` should not be stored in any database. You should use a custom alias. 

6. If you can't get the table to display properly after a few hours, then feel free to go back and just add `TotalProfit` to the `Departments` table.

	* Hint: You will need to use joins to make this work. 

	* Hint: You may need to look into grouping in MySQL.

	* **HINT**: There may be an NPM package that can log the table to the console. What's is it? Good question :)

-------

## Copyright
Ryan Talbot (C) 2016. All Rights Reserved.
