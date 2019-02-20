BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS `Product` (
	`ProductId`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	`Description`	TEXT,
	`Prize`	TEXT,
	`Imgpath`	TEXT,
	`Title`	TEXT
);
INSERT INTO `Product` VALUES (1,'Lettere brugt dødsstjerne. Afhændes billigt','1.000.000.000.000.000.000 kr.','Billeder/Death-Star.jpg','Dødsstjerne');
INSERT INTO `Product` VALUES (2,'Gammel computer fra før skærmens opfindelse.','0,95 kr.','Billeder/Dask.jpg','Gammel computer');
INSERT INTO `Product` VALUES (3,'Køb en flyende bil','7.999.995 kr.','Billeder/flying-car.jpg','Flyvende bil');
COMMIT;
