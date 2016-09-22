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

### Customer View

- To run the customer view, cd into the folder that you forked/cloned from github.
- After double checking that you have all the packages needed installed by running `npm install`, you can run `node BamazonCustomer.js` to run the customer view.
- You will be able to see what is in stock and purchase items. You will also be able to edit your cart before you decide to checkout. 
- One you checkout, your local `Bamazon` database will be updated to reflect the new inventory counts.
- Below is a video of the customer view in action.

**** customer view video coming soon ****

--------

### Manager View

- To run the manager view, cd into the folder that you forked/cloned from github.
- After double checking that you have all the packages needed installed by running `npm install`, you can run `node BamazonManager.js` to run the customer view.
- You will be able to see all the items in the database.
- You can also add inventory to an item or add a new item which will also add the item to the local `Bamazon` SQL database.
- Below is a video of the manager view in action.

**** manager view video coming soon ****

-------

## Copyright
Ryan Talbot (C) 2016. All Rights Reserved.
