const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const sql = require('sqlite3');
const cors = require('cors');

var jsonParser = bodyParser.json();
var textParser = bodyParser.text();

/* funktioner til at tilføje en bruger til databasen
addUser tager et JSON som parameter og indsætter det i db
Den anden funktion addUserToOrder taget bruger ID som parametet
og indsætter i ordre tabellen.
*/
function addUser(form){
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
}

function addUserToOrder(id){
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
    }});
});
}

function addProdToOrderline(form){
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
}
/*
Kald af express samt opsætning af cors og bodyParser
*/
const app = express();
app.use(morgan('dev')); // loging
app.use(cors()); // cors support
app.use(bodyParser.text()); // parse body,

/*
express til tilføje bruger
*/
app.post("/addUser/", async function(req,res){
  var formjson = JSON.parse(req.body);
  try {
    var usId = await addUser(formjson)
    var orId = await addUserToOrder(usId)
    res.status(200).send(JSON.stringify({UserId: usId,OrderId: orId}));
  }
  catch(error) {
    console.error(error);
  }
  //console.log({UserId: usId,OrderId: orId});
});

function checkUser(form){
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
}

function getProd(id){
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
}

function noProd(){
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
}

function getBasket(id){
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
}

function delItem(id){
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
}
/*
Express til login
*/
app.post("/login/", async function(req,res){
  var test= ""
  test = req.body;
  var formjson = JSON.parse(test);
  try {
    var userId = await checkUser(formjson);
    var orId = await addUserToOrder(userId);
    res.status(200).send(JSON.stringify({UserId: userId,OrderId: orId}));
  }
  catch (error){
    console.error(error);
    if (error == "notuser"){
      res.status(200).send(JSON.stringify({UserId: false, OrderId: false}));
    }
  }
});

app.post("/addProd/", async function(req,res){
  var text = ""
  text = req.body;
  var formjson =JSON.parse(text);
  try {
    var orderlineId = await addProdToOrderline(formjson);
    formjson.OrderlineId= orderlineId;
    res.status(200).send(JSON.stringify(formjson));
  }
  catch (error){
    console.error(error);
  }
});

app.get("/getProd/", async (req,res)=>{
  if (req.query.id){
    try {
      let prodjson = await getProd(req.query.id);
      res.status(200).send(JSON.stringify(prodjson));
    }
    catch (error) {
      console.error(error);
    }
  }
  else {
    res.end("false");
  }
});

app.get("/noProd/", async (req,res) => {
  try {
    let no = await noProd();
    res.send(no.toString());
  } catch (error) {
    console.error(error);
  }
});

app.get("/basket/", async (req,res)=>{
  if (req.query.id){
    try {
      let basketjson = await getBasket(req.query.id);
      res.status(200).send(JSON.stringify(basketjson));
    } catch (error){
      console.error(error);
    }
  } else {
    res.end("false");
  }
});

app.get("/delItem/", async (req,res)=>{
  if (req.query.id){
    try {
      let noChanges = await delItem(req.query.id);
      if (noChanges == 0){
        res.send("false");
      } else {
        res.status(200).send("true");
      }
    } catch (error){
        console.error(error);
    }
  } else {
    res.send("false");
  }
});

// Opsæt server på 8080

app.listen(8080, function(){
  console.log('lytter på 8080');
})
