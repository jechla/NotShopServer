const sql = require('sqlite3');
/* funktioner til at tilføje en bruger til databasen
addUser tager et JSON som parameter og indsætter det i db
Den anden funktion addUserToOrder taget bruger ID som parametet
og indsætter i ordre tabellen.
*/
exports.addUser = function (form){
  return new Promise((resolve,reject) => {
  let db = new sql.Database('NotShop.db');

  formArr = [form.navn, form.adresse,form.postnummer, form.telefon, form.email, form.password];

  db.run(`INSERT INTO User (Navn,Adresse,Postnummer,Telefon,Email,Password) VALUES(?,?,?,?,?,?)`, formArr, function(err){
    if (err) {
      reject(err.message);
    }
    // get the last insert id

    resolve(this.lastID);

  });
  db.close((err)=>{  if (err) {
      reject(err.message);
    }});
  });
};

exports.addUserToOrder = function (id){
  return new Promise( (resolve,reject) => {
    let db = new sql.Database('NotShop.db');
    db.run(`INSERT INTO Orders (UserId) VALUES(?)`, [id] , function(err){
      if (err) {
        reject(err.message);
      }
      resolve(this.lastID);
    });
    db.close((err)=>{  if (err) {
        reject(err.message);
      }
    });
  });
};


exports.addProdToOrderline = function (form){
  return new Promise( (resolve,reject) => {
    let db = new sql.Database('NotShop.db');

    db.run(`INSERT INTO Orderline(OrderId,ProductId) VALUES(?,?)`, [form.OrderId,form.ProductId] , function(err){
      if (err) {
        reject(err.message);
      }
      resolve(this.lastID);
    });
    db.close((err)=>{  if (err) {
        reject(err.message);
    }});
  });
};

exports.checkUser = function (form){
  return new Promise( (resolve,reject) => {
    let db = new sql.Database('NotShop.db');

    let sqlCode = `SELECT UserId userId FROM User WHERE Email=? AND Password=?`;

    db.get(sqlCode,[form.email,form.password.toString()], (err,row) =>{
      if (err){
        reject(err.message);
      }
      if (row){
        resolve(row.userId);
      } else {
        reject("notuser");
      }
    });
    db.close((err)=>{
      if (err) {
        reject(err.message);
      }
    });
  });
};

exports.getProd = function (id){
  return new Promise((resolve, reject) => {
    let db = new sql.Database('NotShop.db');

    let sqlCode =`SELECT DISTINCT ProductId productId, Description description, Prize prize, Imgpath imgpath, Title title FROM Product WHERE ProductId=?`;

    db.get(sqlCode,[id], (err,row) => {
      if (err){
        reject(err.message);
      }
      if (row) {
       let prodjson = {Title: row.title,
                      Description: row.description,
                      Prize: row.prize,
                      Imgpath: row.imgpath,
                      ProductId: row.productId
                      };
        resolve(prodjson);
      } else {resolve(false);}
    });

    db.close((err)=> {
      reject(err);
    });
  });
};

exports.noProd = function (){
  return new Promise((resolve,reject) =>{
    let db = new sql.Database('NotShop.db');

    let sqlcode =`SELECT count(ProductId) no FROM Product`;

    db.get(sqlcode,[], (err,row) => {
      if (err){
        reject(err.message);
      }
      if (row) {
        resolve(row.no);
      } else {
        resolve(false);
      }
    });
    db.close((err)=> {
      reject(err);
    });
  });
};

exports.getBasket = function (id){
  return new Promise((resolve,reject) =>{
    let basket = {content: []};
    let db = new sql.Database('NotShop.db');

    let sqlcode =`SELECT OrderlineId orderlineId, ProductId productId FROM Orderline WHERE OrderId=?`;

    db.all(sqlcode,[id], async (err,rows) =>{
      if (err){
        reject(err.message);
      }
      if (rows) {
        try {
          await rows.forEach((row) =>{
            basket.content.push({OrderlineId: row.orderlineId, ProductId: row.productId});
          });
          resolve(basket);
        } catch (error){ reject(error)};
      } else {resolve(false);}
    });
    db.close((err)=> {
      reject(err);
    });
  });
};

exports.delItem = function (id){
  return new Promise((resolve,reject) =>{
    let db = new sql.Database('NotShop.db');

    let sqlcode =`DELETE FROM Orderline where OrderlineId=?`;

    db.run(sqlcode,[id], function(err){
      if (err){
        reject(err.message);
      } else {
        resolve(this.changes);
      }
    });

    db.close((err)=> {
      reject(err);
    });
  });
};
