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

connection.query("SELECT * FROM Products", function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
        stock.push(res[i]);
    }
    displayStock();
    promptBuy();
});

function displayStock() {
    var table = new Table({
        head: ['ID', 'PRODUCT', 'PRICE', 'IN STOCK'],
        colWidths: [6, 32, 14, 14],
        style: {'padding-left': 2, 'padding-right': 2}
    });
    for (var i = 0; i < stock.length; i++) {
        var item = stock[i];
        table.push([item.ItemID, item.ProductName, "$" + item.Price, item.StockQuantity]);
    }
    clear();
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
                for (var index in stock) {
                    if (userItem.id == stock[index].ItemID && userItem.quantity >= parseInt(value)) {
                        isValid = true;
                    }
                }
                return (isValid) ? isValid : "Please enter a valid quantity";
            }
        }
    ]).then(function (buy) {
        updateQuantity(buy.id, buy.quantity);
    });
}

function updateQuantity(id, quantity) {
    var isDupicate = false;


    for (var i in cart) {
        console.log(id, cart[i], id == cart[i].id);
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
        head: ['PRODUCT', 'QUANTITY', 'PRICE', 'TOTAL'],
        colWidths: [30, 12, 12, 20],
        style: {'padding-left': 2, 'padding-right': 2}
    });
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        table.push([item.name, item.quantity, "$" + item.price, "$" + parseFloat((item.price * item.quantity)).toFixed(2)]);
    }
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
    ]).then(function(option) {
        switch(option.choice) {
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

function checkout() {
    var subTotal = 0;

    for (var index in cart) {
        subTotal += (cart[index].price * cart[index].quantity);
    }
    var tax = subTotal * 0.065;
    var total = subTotal + tax;
    var table = new Table({
        head: ['CHECKOUT', ""],
        colWidths: [30, 12]
    });
    table.push(["SUBTOTAL", "$"+ parseFloat(subTotal).toFixed(2)]);
    table.push(["TAXES (6.5%)", "$" + parseFloat(tax).toFixed(2)]);
    table.push(["TOTAL", "$"+ parseFloat(total).toFixed(2)]);

    console.log(table.toString());
    console.log("-----THANKS FOR SHOPPING WITH BAMAZON-----");
    console.log("--------------COME BACK SOON--------------");
    updateSQL();
}

function updateSQL () {
    var queries = '';

    for (var i in stock) {
        queries += mysql.format("UPDATE Products SET StockQuantity=? WHERE ItemID=?; ", [stock[i].StockQuantity, stock[i].ItemID]);
    }

    var sentQuery = connection.query(queries);
    connection.end();
}






















