const express = require('express');
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
var app = express();
app.use(cors());
app.use(bodyParser.text());

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

    let sqlCode = `SELECT UserId userId FROM User WHERE Navn=? AND Password=?`;

    db.get(sqlCode,[form.username,form.password], (err,row) =>{
      if (err){
        reject(err.message);
      }
      if (row){
        resolve(row.userId);
      } else {
        reject("notuser");
      }
    });
    db.close((err)=>{  if (err) {
        reject(err.message);
      }});
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
  try{
  let db = new sql.Database('NotShop.db');

  let sqlCode =`SELECT ProductId productId, Description description, Prize prize, Imgpath imgpath, Title title FROM Product`;

  await db.all(sqlCode,[],async (err,rows) => {
    try{
    if (err){
      console.log(err.message);
    } else {
      await rows.forEach((row) => {
        var prodjson = {Title: row.title,
                        Description: row.description,
                        Prize: row.prize,
                        Imgpath: row.imgpath,
                        ProductId: row.productId
                      };
        res.write(JSON.stringify(prodjson));
      });
      res.end();
    }
  } catch (error){console.error(error);}
  });

  db.close((err)=> {
    console.log(err);
  });

}
  catch (error){
    console.error(error);
  }
});

// Opsæt server på 8080

app.listen(8080, function(){
  console.log('lytter på 8080');
})
