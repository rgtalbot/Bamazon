var inquirer = require('inquirer');
var mysql = require('mysql');
var clear = require('clear');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "",
    database: "Bamazon",
    multipleStatements: true
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});

var stock = [],
    cart = [];

function customer() {

    connection.query("SELECT * FROM Products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            stock.push(res[i]);
        }
        displayStock();
        promptBuy();
    });
}

function displayStock() {
    var table = new Table({
        head: ['ID', 'PRODUCT', 'PRICE', 'IN STOCK'],
        colWidths: [6, 32, 14, 14],
        style: {'padding-left': 2, 'padding-right': 2}
    });
    for (var i = 0; i < stock.length; i++) {
        var item = stock[i];
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
    console.log(table.toString());
}

function promptBuy() {
    var userItem = {
        id: 0,
        quantity: 0,
        price: 0
    };
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the [ID] for the item you would like to purchase",
            name: "id",
            validate: function (value) {
                var isValid = false;
                for (var index in stock) {
                    if (stock[index].ItemID == parseInt(value)) {
                        isValid = true;
                        userItem.id = stock[index].ItemID;
                        userItem.quantity = stock[index].StockQuantity;
                        userItem.price = stock[index].Price;
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
                if (isNaN(value) == false) {
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
        buyUpdate(buy.id, buy.quantity);
    });
}

function buyUpdate(id, quantity) {
    var isDupicate = false;


    for (var i in cart) {

        if (cart[i].id == id) {
            cart[i].quantity += parseInt(quantity);
            isDupicate = true;
            for (var j in stock) {
                if (cart[i].id == stock[j].ItemID) {
                    stock[j].StockQuantity -= quantity;
                }
            }
        }
    }

    console.log(isDupicate);
    if (!isDupicate) {
        console.log('here');
        for (var k in stock) {
            if (stock[k].ItemID == id) {
                cart.push({
                    id: id,
                    name: stock[k].ProductName,
                    quantity: parseInt(quantity),
                    price: stock[k].Price
                });
                stock[k].StockQuantity -= quantity;
            }
        }
    }


    displayStock();
    shoppingCart();
    promptOptions();
}

function shoppingCart() {
    var table = new Table({
        head: ['ID', 'PRODUCT', 'QUANTITY', 'PRICE', 'TOTAL'],
        colWidths: [6, 24, 12, 12, 12],
        style: {'padding-left': 2, 'padding-right': 2}
    });
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        table.push([item.id, item.name, item.quantity, "$" + item.price, "$" + parseFloat((item.price * item.quantity)).toFixed(2)]);
    }
    console.log("----------------------------------------------------------------------");
    console.log("                                                                      ");
    console.log("                            SHOPPING CART                             ");
    console.log("                                                                      ");
    console.log("----------------------------------------------------------------------");
    console.log(table.toString());
}

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

function updateCart() {
    clear();
    displayStock();
    shoppingCart();
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["Update Quantity", "Remove Item"],
            name: "choices"
        }
    ]).then(function (choice) {
        switch (choice.choices) {
            case "Update Quantity":
                updateQuantity();
                break;
            case "Remove Item":
                removeItem();
                break;
        }
    });
}

function removeItem() {
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the [id] for the item you would like to remove: ",
            name: "id",
            validate: function (value) {
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
        for (var index in cart) {
            if (cart[index].id == parseInt(value.id)) {
                restock = cart[index].quantity;
            }
        }
        for (var i in stock) {
            if (stock[i].ItemID == value.id) {
                stock[i].StockQuantity += restock;
            }
        }
        cart = cart.filter(function (obj) {
            return value.id.indexOf(obj.id) === -1;
        });
        displayStock();
        shoppingCart();
        promptOptions();
    });
}

function updateQuantity() {
    var userItem = {
        id: 0,
        quantity: 0,
        price: 0
    };
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the [id] for the item you would like to update: ",
            name: "id",
            validate: function (value) {
                var isValid = false;
                for (var index in cart) {
                    if (cart[index].id == parseInt(value)) {
                        isValid = true;
                        userItem.id = cart[index].id;
                        userItem.quantity = parseInt(cart[index].quantity);
                        userItem.price = cart[index].price;
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
                if (isNaN(value) == false && value > 0) {
                    for (var index in cart) {
                        if (userItem.id == cart[index].id) {
                            for (var i in stock) {
                                if (userItem.id == stock[i].ItemID) {
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
        for (var index in stock) {
            console.log(index, userItem.id, index === userItem.id);
            if (stock[index].ItemID == userItem.id) {
                stock[index].StockQuantity += parseInt(userItem.quantity);
                console.log(stock[index].StockQuantity);
            }
        }
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
        displayStock();
        shoppingCart();
        promptOptions();
    });
}

function checkout() {
    var subTotal = 0;

    for (var index in cart) {
        subTotal += (cart[index].price * cart[index].quantity);
    }
    var tax = subTotal * 0.065;
    var total = subTotal + tax;
    var table = new Table({
        colWidths: [30, 12, 12, 12]
    });
    table.push([" ", " ", "SUBTOTAL", "$" + parseFloat(subTotal).toFixed(2)]);
    table.push([" ", " ", "TAXES", "$" + parseFloat(tax).toFixed(2)]);
    table.push([" ", " ", "TOTAL", "$" + parseFloat(total).toFixed(2)]);

    console.log(table.toString());
    console.log("----------------------------------------------------------------------");
    console.log("                                                                      ");
    console.log("                   THANKS FOR SHOPPING WITH BAMAZON                   ");
    console.log("                                                                      ");
    console.log("                            COME BACK SOON                            ");
    console.log("                                                                      ");
    console.log("----------------------------------------------------------------------");
    updateSQL();
}

function updateSQL() {
    var queries = '';

    for (var i in stock) {
        queries += mysql.format("UPDATE Products SET StockQuantity=? WHERE ItemID=?; ", [stock[i].StockQuantity, stock[i].ItemID]);
    }

    var sentQuery = connection.query(queries);
    connection.end();
}


customer();



















