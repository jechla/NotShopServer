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
  let db = new sql.Database('NotShop.db');

  let sqlCode = `SELECT UserId userId FROM User WHERE Navn=? AND Password=?`;

  db.get(sqlCode,[form.username,form.password], (err,row) =>{
    if (err){
      return console.error(err.message);
    }
    return row.userId;
  });
}


/*
Express til login
*/
app.post("/login/", function(req,res){
  var formjson = JSON.parse(req.boby);
  console.log(formjson);
  var userId = checkUser(formjson);
  console.log(formjson);
  res.status(200).send(JSON.stringify({UserId: "1",OrderId: "1"}));
});


// Opsæt server på 8080

app.listen(8080, function(){
  console.log('lytter på 8080');
})
