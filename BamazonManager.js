//required npm packages. can all be installed with package.json
var inquirer = require('inquirer');
var mysql = require('mysql');
var clear = require('clear');
var Table = require('cli-table');

//creating the connection to the Bamazon database.
//you can run the Bamazon.sql script in your mySQL Workbench and then change your port, user, and password here
var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "",
    database: "Bamazon",
    multipleStatements: true
});

//testing the connection before doing anything else
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});

//variables for the items in stock from the database and the items to be added to the database
var stock = [],
    newStock = [];

//function to fetch all the stock in the database and store it locally in an array.
function manager() {
    //query all the items from the products table and push them to the stock array
    connection.query("SELECT * FROM Products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            stock.push(res[i]);
        }
        displayStock("ALL");
        promptManager();
    });
}

//function that prompts manager for what they want to do and then executes functions based on that selection
function promptManager() {
    inquirer.prompt([
        {
            type: "list",
            message: "Hello Manager, what would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit Manager View"],
            name: "choice"
        }
    ]).then(function (selection) {
        switch (selection.choice) {
            case "View Products for Sale":
                displayStock("ALL");
                promptManager();
                break;
            case "View Low Inventory":
                displayStock("LOW");
                promptManager();
                break;
            case "Add to Inventory":
                addInventory();
                break;
            case "Add New Product":
                addProduct();
                break;
            case "Exit Manager View":
                exit();
                break;
        }
    })
}

//function that displays the items in stock
function displayStock(string) {
    //table creation using cli-table package
    var table = new Table({
        head: ['ID', 'PRODUCT', 'PRICE', 'IN STOCK'],
        colWidths: [6, 32, 14, 14],
        style: {'padding-left': 2, 'padding-right': 2}
    });
    for (var i = 0; i < stock.length; i++) {
        var item = stock[i];
        if (string === "ALL") {
            //if the user selected view products for sale, "ALL" is sent to this function and all items are push to the table
            table.push([item.ItemID, item.ProductName, "$" + item.Price, item.StockQuantity]);
            clear();
            console.log("----------------------------------------------------------------------");
            console.log("                         BAMAZON MANAGER VIEW                         ");
            console.log("                                                                      ");
            console.log("              HERE ARE ALL THE PRODUCTS WE CURRENTLY SELL             ");
            console.log("----------------------------------------------------------------------");
            //displays the table
            console.log(table.toString());
        } else if (string === "LOW") {
            //if the user selected view low inventory, "LOW" is sent to this function and only items with less than 5 quantity are pushed to the table
            if (stock[i].StockQuantity <= 5) {
                table.push([item.ItemID, item.ProductName, "$" + item.Price, item.StockQuantity]);
            }
            clear();
            console.log("----------------------------------------------------------------------");
            console.log("                         BAMAZON MANAGER VIEW                         ");
            console.log("                                                                      ");
            console.log("                HERE IS WHAT ITEMS ARE LOW ON INVENTORY               ");
            console.log("----------------------------------------------------------------------");
            //displays the table
            console.log(table.toString());
        }
    }
}

function addInventory() {
    displayStock("ALL");

    //var for storing the selected item's info from the first prompt for the second prompt
    var userItem = {
        id: 0,
        quantity: 0
    };
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the [ID] you would like to add to: ",
            name: "id",
            validate: function (value) {
                var isValid = false;
                //check to see if the id entered matches an id in the database
                for (var index in stock) {
                    if (stock[index].ItemID == parseInt(value)) {

                        //if it does, return true and store the id and quantity for the next validation
                        isValid = true;
                        userItem.id = stock[index].ItemID;
                        userItem.quantity = parseInt(stock[index].StockQuantity);
                    }
                }
                return (isValid) ? isValid : "Please enter a valid [ID]";
            }
        },
        {
            type: "input",
            message: "How many units would you like to add to the inventory?",
            name: "quantity",
            validate: function (value) {
                //check to see if the value entered is a number greater than 0
                if (isNaN(value) == false && value > 0) {
                    //add the value entered to the current stock
                    var totalSpace = parseInt(value) + userItem.quantity;
                    //check to see if the current stock + new stock exceeds 200
                    if (totalSpace > 200) {
                        return "We do not have the warehouse space for that much inventory."
                    } else {
                        return true;
                    }

                } else {
                    return "Please enter a valid number";
                }
            }
        }
    ]).then(function(res) {
        //find the item in the stock array
        for (var i in stock) {
            if (stock[i].ItemID == res.id) {
                //update the quantity in the stock array
                stock[i].StockQuantity += parseInt(res.quantity);
            }
        }
        displayStock("ALL");
        promptManager();
    });
}

function addProduct() {
    console.log("not working yet");
    connection.end();
}

function exit() {
    console.log('goodbye');
    connection.end();
}

manager();
