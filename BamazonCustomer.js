var inquirer = require('inquirer');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "",
    database: "Bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    displayStock();
});

var stock = [];

function displayStock() {
    connection.query("SELECT * FROM Products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].ItemID + " | Item: " + res[i].ProductName + " | Department: " + res[i].DepartmentName + " | Price: $" + res[i].Price + " | Quantity: " + res[i].StockQuantity);
            stock.push(res[i]);
        }

        console.log(stock);
        console.log(stock[0]);
    });
}

function promptBuy() {
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the [ID] for the item you would like to purchase",
            name: "id"
        },
        {
            type: "input",
            message: "Please enter the quantity you would like to purchase",
            name: "quantity"
            // validate: function (value) {
            //     if (typeof value !== 'number')
            //         return "Please enter a valid quantity";
            //     else return true;
            // }
        }
    ]).then(function (buy) {
        console.log('Quantity entered', buy.quantity);
        console.log('parsed', parseInt(buy.quantity));
        console.log("buy id", buy.id);
        connection.query("SELECT * FROM Products WHERE id=?", [buy.id], function (err, res) {
            console.log(res);
            // if (res[0].StockQuantity <= buy.quantity) {
            //     console.log("Insufficient quantity!");
            //     promptBuy();
            // } else {
            //     var newQuantity = res[0].StockQuantity - buy.quantity;
            //     connection.query('UPDATE Products SET ? WHERE ?', [
            //         {
            //             StockQuantity: newQuantity
            //         }, {
            //             id: res[0].id
            //         }
            //     ], function (err, res) {
            //     });
                // console.log("Your total cost for " + buy.quantity + " is $" + (buy.quantity * res[0].price) + ".");
            })
        })
    }
