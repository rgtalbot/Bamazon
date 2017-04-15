CREATE SCHEMA `Bamazon`;

USE `Bamazon`;

CREATE TABLE `Bamazon`.`Products` (
  `ItemID`         INT            NOT NULL AUTO_INCREMENT,
  `ProductName`    VARCHAR(45)    NOT NULL,
  `DepartmentName` VARCHAR(45)    NOT NULL,
  `Price`          DECIMAL(10, 2) NOT NULL,
  `StockQuantity`  INT            NOT NULL,
  PRIMARY KEY (`ItemID`),
  UNIQUE INDEX `ItemID_UNIQUE` (`ItemID` ASC)
);

INSERT INTO `Bamazon`.`Products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`)
VALUES ('YurBuds', 'Music', 34.99, 53);
INSERT INTO `Bamazon`.`Products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`)
VALUES ('Yeti Tumbler', 'DrinkWare', 39.99, 40);
INSERT INTO `Bamazon`.`Products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`)
VALUES ('MacBook Pro', 'Electronics', 2139.99, 3);
INSERT INTO `Bamazon`.`Products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`)
VALUES ('iPhone Case', 'Electronics', 19.99, 38);
INSERT INTO `Bamazon`.`Products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`)
VALUES ('FitBit Charge HR', 'Fitness', 149.95, 22);
INSERT INTO `Bamazon`.`Products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`)
VALUES ('Wrapping Paper', 'Holiday', 9.95, 10);
INSERT INTO `Bamazon`.`Products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`)
VALUES ('Cooler', 'Outdoors', 104.99, 8);
INSERT INTO `Bamazon`.`Products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`)
VALUES ('Ladder', 'Hardware', 88.95, 3);
INSERT INTO `Bamazon`.`Products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`)
VALUES ('Water Bottle', 'Fitness', 9.95, 23);
INSERT INTO `Bamazon`.`Products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`)
VALUES ('Drill Bit', 'Hardware', 4.95, 55);