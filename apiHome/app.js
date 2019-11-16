const express = require("express");

const bodyParser = require('body-parser');

const server = express();

const jwt = require('jsonwebtoken');

var router = express.Router();

const path = require('path');

var MD5 = require('crypto-md5');

const mysql = require('mysql');

var fs = require('fs-extra');

var multer = require('multer');

const request = require('request');

const util = require('util');

//uncomment it later
//const exec = util.promisify(require('child_process').exec);

var connection = mysql.createPool({
    host:'',
    user:'',
    password:'',
    database:''
});

/*connection.connect(function(err){
    if(!err) {
        console.log("Database is connected ... nn");
    } else {
        console.log("Error connecting database ... nn");
    }
});*/


const secret_key = "sdkfjsldkjflskdfjlsdjflksjdflksdrPInxiiVZ";


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../python/rosters");
  },
  filename: function (req, file, cb) {
    var x = req.body.field1;
    try {
      var decoded = jwt.verify(x, secret_key);
      cb(null, Date.now() + '.xlsx');
    } catch(err) {
      console.log(err);
    }
  }
});
var upload = multer({ storage: storage });

server.use(express.static('../shift'));

server.set('view engine', 'html');


server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json({limit:'50mb'}));
// server.use(upload.array());



var requestParser = bodyParser.urlencoded({ extended: false });

server.use('/shift/apiHome',router);

router.get('/', function(req,res){
    res.json({
        message: "welcome to cicindia's api server"
    });
});


//////////////////////functions declaration/////////////////////////////////////
function createJWT(x,y){
    var claims = {
      email:x,
      iss:"Deloitte CIC",
      iat:Date.now(),
      exp:Math.floor(Date.now()) + (60*30000000),//expiration is never
      type:y
    };
    var token = "";
    try{
        token = jwt.sign(claims, secret_key);
    }
    catch(err){
        token = err.toString();
    }
    return token;
}
////////////////////////////////////////////////////////////////////////////////

router.post('/login',requestParser, function(req,res){
        res.header("Access-Control-Allow-Origin","*");
        var email = req.body.field1;
        var password = req.body.field2;
        var check = `SELECT name,type from creds WHERE name='${email}' AND hash='${password}'`;
        connection.query(check, function(err,result){
                if(err){
                    res.json({
                        "message":err.toString()
                    });
                }
                else{
                    if(result.length==1){
                      console.log(result);
                      var xjwt = createJWT(email,result[0].type);
                      res.statusCode = 200;
                      //res.header("Set-Cookie","cookieName="+ xjwt +";");
                      res.json({
                        "key":xjwt
                      });
                    }
                    else{
                        res.json({
                            "message":"Wrong email or password",
                            "status":"unsuccessful"
                        });
                    }
                }
            });
});



//upload a file using multer
router.get("/test",function(req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.set({
     'content-type': 'application/json',
     'Warning': "Private and confidential. Unauthorized use is prohibited."
  });
    res.json({
        "message":"it works"
    });

});

server.listen(3333,()=>console.log("server started here"));
