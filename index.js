const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
//const sql = require('sqlite3');
const cors = require('cors');
const notshopdb = require('./lib/notshopdb.js');

var jsonParser = bodyParser.json();
var textParser = bodyParser.text();

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
    var usId = await notshopdb.addUser(formjson)
    var orId = await notshopdb.addUserToOrder(usId)
    res.status(200).send(JSON.stringify({UserId: usId,OrderId: orId}));
  }
  catch(error) {
    console.error(error);
  }
  //console.log({UserId: usId,OrderId: orId});
});
/*
Express til login
*/
app.post("/login/", async function(req,res){
  var test= ""
  test = req.body;
  var formjson = JSON.parse(test);
  try {
    var userId = await notshopdb.checkUser(formjson);
    var orId = await notshopdb.addUserToOrder(userId);
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
    var orderlineId = await notshopdb.addProdToOrderline(formjson);
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
      let prodjson = await notshopdb.getProd(req.query.id);
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
    let no = await notshopdb.noProd();
    res.send(no.toString());
  } catch (error) {
    console.error(error);
  }
});

app.get("/basket/", async (req,res)=>{
  if (req.query.id){
    try {
      let basketjson = await notshopdb.getBasket(req.query.id);
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
      let noChanges = await notshopdb.delItem(req.query.id);
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
