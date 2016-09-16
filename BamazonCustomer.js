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

//variables for the items in stock from the database and the items to be added to the cart
var stock = [],
    cart = [];


//function to start the shopping experience
function customer() {

    //query all the items from the products table and push them to the stock array
    connection.query("SELECT * FROM Products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            stock.push(res[i]);
        }

        //display the stock
        displayStock();
        //prompt the user to start shopping
        promptBuy();
    });
}

//function that displays the items in stock
function displayStock() {

    //table creation using cli-table package
    var table = new Table({
        head: ['ID', 'PRODUCT', 'PRICE', 'IN STOCK'],
        colWidths: [6, 32, 14, 14],
        style: {'padding-left': 2, 'padding-right': 2}
    });
    for (var i = 0; i < stock.length; i++) {
        var item = stock[i];

        //if item is in stock, push to the table
        if (stock[i].StockQuantity > 0) {
            table.push([item.ItemID, item.ProductName, "$" + item.Price, item.StockQuantity]);
        }
    }
    clear();
    console.log("----------------------------------------------------------------------");
    console.log("                          WELCOME TO BAMAZON                          ");
    console.log("                                                                      ");
    console.log("                     HERE IS WHAT WE HAVE IN STOCK                    ");
    console.log("----------------------------------------------------------------------");
    //displays the table
    console.log(table.toString());
}

//function that prompts the user to start shopping
function promptBuy() {

    //storing the item the user selects for validation in the second prompt
    var userItem = {
        id: 0,
        quantity: 0
    };
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the [ID] for the item you would like to purchase",
            name: "id",
            validate: function (value) {
                var isValid = false;

                //validates that the value entered matched an id for an item in stock
                for (var index in stock) {
                    if (stock[index].ItemID == parseInt(value)) {
                        isValid = true;
                        //stores the data from the item the user selected in the local var to use later
                        userItem.id = stock[index].ItemID;
                        userItem.quantity = stock[index].StockQuantity;
                    }
                }
                return (isValid) ? isValid : "Please enter a valid [ID]";

            }
        },
        {
            type: "input",
            message: "Please enter the quantity you would like to purchase",
            name: "quantity",
            validate: function (value) {
                var isValid = false;

                //validates that the quantity entered is a number
                if (isNaN(value) == false) {

                    //validates that there is enough quantity in stock for the user to be able to purchase the quantity entered.
                    for (var index in stock) {
                        if (userItem.id == stock[index].ItemID && userItem.quantity >= parseInt(value)) {
                            isValid = true;
                        }
                    }
                    return (isValid) ? isValid : "We do not have enough stock for that order";
                } else {
                    return "Please enter a valid number";
                }

            }
        }
    ]).then(function (buy) {
        //runs the buy update function
        buyUpdate(buy.id, buy.quantity);
    });
}

//adds a purchased item to the cart
function buyUpdate(id, quantity) {
    var isDupicate = false;

    //checks to see if the item is already in the cart
    for (var i in cart) {

        if (cart[i].id == id) {
            //if the item is already in the cart, it adds the quantity of the purchase to the quantity already in the cart
            cart[i].quantity += parseInt(quantity);
            isDupicate = true;

            //removes the quantity from the amount in stock
            for (var j in stock) {
                if (cart[i].id == stock[j].ItemID) {
                    stock[j].StockQuantity -= quantity;
                }
            }
        }
    }

    //if not already in the cart
    if (!isDupicate) {

        //find the id in the stock array
        for (var k in stock) {
            if (stock[k].ItemID == id) {
                //push the item to the cart
                cart.push({
                    id: id,
                    name: stock[k].ProductName,
                    quantity: parseInt(quantity),
                    price: stock[k].Price
                });
                //subtract the user quantity wanted from the quantity in stock
                stock[k].StockQuantity -= quantity;
            }
        }
    }

    //display the updated stock
    displayStock();
    //display the shopping cart
    shoppingCart();
    //prompt the user to continue shopping or checkout
    promptOptions();
}

//function that displays the shopping cart
function shoppingCart() {

    //new cli-table for the shopping cart
    var table = new Table({
        head: ['ID', 'PRODUCT', 'QUANTITY', 'PRICE', 'TOTAL'],
        colWidths: [6, 24, 12, 12, 12],
        style: {'padding-left': 2, 'padding-right': 2}
    });

    //push the items in the cart array to the shopping cart table
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        table.push([item.id, item.name, item.quantity, "$" + item.price, "$" + parseFloat((item.price * item.quantity)).toFixed(2)]);
    }
    console.log("----------------------------------------------------------------------");
    console.log("                                                                      ");
    console.log("                            SHOPPING CART                             ");
    console.log("                                                                      ");
    console.log("----------------------------------------------------------------------");
    //display the shopping cart table
    console.log(table.toString());
}


//options the user is given after they select an item for purchase
function promptOptions() {
    inquirer.prompt([
        {
            type: "list",
            message: "Would you like to ... ?",
            choices: ["Continue Shopping", "Update Cart", "Checkout"],
            name: "choice"
        }
    ]).then(function (option) {
        switch (option.choice) {
            case "Continue Shopping":
                promptBuy();
                break;
            case "Update Cart":
                updateCart();
                break;
            case "Checkout":
                checkout();
                break;
        }
    });
}

//function that runs if the user chooses the Update Cart selection
function updateCart() {
    clear();
    displayStock();
    shoppingCart();
    //prompt the user to see if they want to update a quantity in the cart or remove an item in the cart
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["Update Quantity", "Remove Item"],
            name: "choices"
        }
    ]).then(function (choice) {
        switch (choice.choices) {
            //run a function based on their choices
            case "Update Quantity":
                updateQuantity();
                break;
            case "Remove Item":
                removeItem();
                break;
        }
    });
}


//function to remove an item from the cart
function removeItem() {
    //prompt user for the item they want to remove
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the [id] for the item you would like to remove: ",
            name: "id",
            validate: function (value) {
                //validate that the id they entered matches an id for an item in their cart
                var isValid = false;
                for (var index in cart) {
                    if (cart[index].id == parseInt(value)) {
                        isValid = true;
                    }
                }
                return (isValid) ? isValid : "Please enter a valid [ID]";
            }
        }
    ]).then(function (value) {
        var restock = 0;

        //grab the quantity of the item that is in the cart
        for (var index in cart) {
            if (cart[index].id == parseInt(value.id)) {
                restock = cart[index].quantity;
            }
        }
        //put that quantity back in stock
        for (var i in stock) {
            if (stock[i].ItemID == value.id) {
                stock[i].StockQuantity += restock;
            }
        }
        //remove the selected item object from the cart array
        cart = cart.filter(function (obj) {
            return value.id.indexOf(obj.id) === -1;
        });

        //display stock,cart, and prompt user
        displayStock();
        shoppingCart();
        promptOptions();
    });
}

//function to update the quanitity of an item in the cart
function updateQuantity() {
    //variable for locally storing information from the first prompt for the second one
    var userItem = {
        id: 0,
        quantity: 0
    };
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the [id] for the item you would like to update: ",
            name: "id",
            validate: function (value) {
                //validates that the id they entered matches an id in the cart
                var isValid = false;
                for (var index in cart) {
                    if (cart[index].id == parseInt(value)) {
                        isValid = true;
                        //if the id's match, stores the information locally for validating quantity.
                        userItem.id = cart[index].id;
                        userItem.quantity = parseInt(cart[index].quantity);
                    }
                }
                return (isValid) ? isValid : "Please enter a valid [ID]";
            }
        },
        {
            type: "input",
            message: "Please enter the updated quantity: ",
            name: "quantity",
            validate: function (value) {
                var isValid = false;
                //validates that the quantity is a number greater than 0
                if (isNaN(value) == false && value > 0) {

                    for (var index in cart) {
                        //find the id the user selected in the cart array
                        if (userItem.id == cart[index].id) {
                            for (var i in stock) {
                                //find the id the user selected in the stock array
                                if (userItem.id == stock[i].ItemID) {
                                    //check to see if the amount in stock and currently in the cart is greater than the quantity entered by the user
                                    if (stock[i].StockQuantity+cart[index].quantity >= value) {
                                        isValid = true;
                                    } else {
                                        isValid = "We do not have that many in stock."
                                    }
                                }
                            }
                        }
                    }
                    return (isValid);
                } else {
                    return "Please enter a valid number";
                }
            }
        }
    ]).then(function (choice) {

        //put the quantity already in the cart back in stock
        for (var index in stock) {
            if (stock[index].ItemID == userItem.id) {
                stock[index].StockQuantity += parseInt(userItem.quantity);
            }
        }
        //subtract the new quantity from stock after the old quantity has been restocked
        for (var i in cart) {
            if (cart[i].id == userItem.id) {
                cart[i].quantity = parseInt(choice.quantity);
                for (var j in stock) {
                    if (cart[i].id == stock[j].ItemID) {
                        stock[j].StockQuantity -= parseInt(choice.quantity);
                    }
                }
            }
        }
        //dispay items in stock, shopping cart, and promt the user
        displayStock();
        shoppingCart();
        promptOptions();
    });
}


//function to run if the user decides to checkout
function checkout() {
    var subTotal = 0;

    //add up the price of all the items in the cart
    for (var index in cart) {
        subTotal += (cart[index].price * cart[index].quantity);
    }
    //calculate the taxes for their purchase
    var tax = subTotal * 0.065;
    //calculate the total with tax
    var total = subTotal + tax;
    //create a checkout table with the cli-table package
    var table = new Table({
        colWidths: [30, 12, 12, 12]
    });

    //push the subtotal, taxes, and total to the table with blank " " so that it lines up with the shopping cart
    table.push([" ", " ", "SUBTOTAL", "$" + parseFloat(subTotal).toFixed(2)]);
    table.push([" ", " ", "TAXES", "$" + parseFloat(tax).toFixed(2)]);
    table.push([" ", " ", "TOTAL", "$" + parseFloat(total).toFixed(2)]);


    //display the shopping cart and a thank you for shopping message
    console.log(table.toString());
    console.log("----------------------------------------------------------------------");
    console.log("                                                                      ");
    console.log("                   THANKS FOR SHOPPING WITH BAMAZON                   ");
    console.log("                                                                      ");
    console.log("                            COME BACK SOON                            ");
    console.log("                                                                      ");
    console.log("----------------------------------------------------------------------");
    //update the database function
    updateSQL();
}

//function to update the mySQL database after the user is done shopping
function updateSQL() {

    //create a variable to run multiple queries
    var queries = '';

    for (var i in stock) {
        //add a query to update the stock quantity in the databse for each id from the stock array to the query list
        //the semicolon and space are key so that it logs multiple queries in the variable to run
        queries += mysql.format("UPDATE Products SET StockQuantity=? WHERE ItemID=?; ", [stock[i].StockQuantity, stock[i].ItemID]);
    }

    //run all the queries to update the SQL database
    var sentQuery = connection.query(queries);

    //end the connection!
    connection.end();
}

//START THE SHOPPING EXPERIENCE
customer();



















