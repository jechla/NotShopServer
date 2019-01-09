const express = require('express');
const bodyParser = require('body-parser');
const sql = require('sqlite3');
const cors = require('cors');

var jsonParser = bodyParser.json();
var textParser = bodyParser.text();

/*var addUser = express();
addUser.get("/:data", function(req,res){
  console.log(req.params.data);
  res.send(JSON.stringify({UserId: "1",OrderId: "1"}));
});
/*
addUser.post("/", textParser, function(req,res){
  if (!req.body){
    console.log('ingen body,navn');
  }
  let addUserForm = JSON.parse(req.body);
  console.log(addUserForm);
  res.set('Content-Type', 'text/html');
  res.send(JSON.stringify({UserId: "1",OrderId: "1"}));
});
/*
var login = express();
login.post("/" textParser, function(req,res){

});
*/
function addUser(form, callback){
  let db = new sql.Database('NotShop.db');

  formArr = [form.navn, form.adresse,form.postnummer, form.telefon, form.email, form.password];
  //var UsID = 0;


  db.run(`INSERT INTO User (Navn,Adresse,Postnummer,Telefon,Email,Password) VALUES(?,?,?,?,?,?)`, formArr, function(err){
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    db.close((err)=>{  if (err) {
        return console.log(err.message);
      }});
    callback(this.lastID);
    //UsID = this.lastID;
     //console.log(`A row has been inserted with rowid ${this.lastID}`);
     //console.log(`indhold i UsID ${UsID}`);

  });
  /*db.run(`INSERT INTO Orders (UserId) VALUES(?)`, [parseInt(UsID,10)] , function(err){
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    OrID = this.lastID;
    console.log(`indhold i OrID ${OrID}`);
  });*/

  //console.log(`test hvad er der i UsID: ${UsID}`);
  //db.close();
  //callback(UsID);
}

function addUserToOrder(id, callback){
  //var OrID = 0;
  let db = new sql.Database('NotShop.db');
  db.run(`INSERT INTO Orders (UserId) VALUES(?)`, [id] , function(err){
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    db.close((err)=>{  if (err) {
        return console.log(err.message);
      }});
    callback(id,this.lastID);
    //console.log(`indhold i OrID ${OrID}`);
  });
  //db.close();
  //callback(id,OrID);
}
var app = express();
app.use(cors());
app.get("/addUser/:data", function(req,res){
  var formjson = JSON.parse(req.params.data.substring(1));
  addUser(formjson, (ret) => {
    addUserToOrder(ret, (UsID,OrID)=>{
      console.log(`return fra chain UsID: ${UsID}`);
      console.log(`return fra chain OrID: ${OrID}`);
      res.status(200).send(JSON.stringify({UserId: UsID,OrderId: OrID}));
      console.log({UserId: UsID,OrderId: OrID});
      //res.end();
    });
  });
  console.log(formjson);
  //console.log(ret);
  //res.status(200).send(JSON.stringify({UserId: "1",OrderId: "1"}));
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
