const express = require('express');
const bodyParser = require('body-parser');
const sql = require('sqlite3');
const cors = require('cors');

var jsonParser = bodyParser.json();
var textParser = bodyParser.text();


function addUser(form){
  return new Promise((resolve,reject) => {
  let db = new sql.Database('NotShop.db');

  formArr = [form.navn, form.adresse,form.postnummer, form.telefon, form.email, form.password];



  db.run(`INSERT INTO User (Navn,Adresse,Postnummer,Telefon,Email,Password) VALUES(?,?,?,?,?,?)`, formArr, function(err){
    if (err) {
      reject(console.log(err.message));
    }
    // get the last insert id

    resolve(this.lastID);

  });
  db.close((err)=>{  if (err) {
      reject(console.log(err.message));
    }});
  });
}

function addUserToOrder(id){
  return new Promise( (resolve,reject) => {
  let db = new sql.Database('NotShop.db');
  db.run(`INSERT INTO Orders (UserId) VALUES(?)`, [id] , function(err){
    if (err) {
      reject( console.log(err.message));
    }


    resolve(this.lastID);
    //console.log(`indhold i OrID ${OrID}`);
  });
  db.close((err)=>{  if (err) {
      reject( console.log(err.message)<9;
    }});
});
}

var app = express();
app.use(cors());
app.post("/addUser/", async function(req,res){
  var formjson = JSON.parse(req.params.data.substring(1));
  try {
    let usId = await addUser(formjson)
    let orId = await addUserToOrder(usId)
    res.status(200).send(JSON.stringify({UserId: usId,OrderId: orId}));
  };
  catch {};
  console.log({UserId: usId,OrderId: orId});
});


app.get("/login/:data", function(req,res){
  var formjson = JSON.parse(req.params.data.substring(1));
  console.log(formjson);
  res.status(200).send(JSON.stringify({UserId: "1",OrderId: "1"}));
});
//app.use("/addUser",addUser);
//app.use("/login",login);


app.listen(8080, function(){
  console.log('lytter på 8080');
})
