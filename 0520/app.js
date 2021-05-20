var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app).listen(80);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

let mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'test'
});
connection.connect();


app.get('/searchItem', function (req, res) {
  res.sendfile("form.html");
});

app.get('/insertForm', function (req, res) {
  res.sendfile("insertForm.html");
});

app.get('/getItem_db', function (req, res) {
  connection.query(`SELECT * FROM item ORDER BY itemPrice`,
    function (error, results, fields) {

      let priceTable = results
      var itemName = "구매불가"
      let price = req.query.price

      for (var i = 0; i < priceTable.length; i++) {
        if (priceTable[i].itemPrice <= price) {
          itemName = priceTable[i].itemName;
        }
      }
      res.send(itemName + ""); // 숫자를 보낼 땐 status code만
      // console.log(itemName); // cmd 창에 띄우기
    });
});

app.post('/inputDB', function (req, res) {

  connection.query(`SELECT * FROM item where itemName = '${req.body.itemName}' or itemPrice = ${req.body.itemPrice}`,
    function (error, results, fields) {
      // res.send(results)
      if (results.length == 0) {
        connection.query(`INSERT INTO item (itemName, itemPrice) VALUES('${req.body.itemName}',${req.body.itemPrice})`,
          function (error, results, fields) {
            if (error) {
              res.send("not ok");
            } else if (results.affectedRows == 1) {
              res.send("ok")
            }
          });
      }


      // else if (results.length == 1 && results[0].itemName == req.body.itemName && results[0].itemPrice != req.body.itemPrice) {
      //   res.send("same name")
      // }
      // else if (results.length == 1 && results[0].itemPrice == req.body.itemPrice && results[0].itemName != req.body.itemName) {
      //   res.send("same price")
      // }
      // else if (results.length == 1 && results[0].itemPrice == req.body.itemPrice && results[0].itemName == req.body.itemName) {
      //   res.send("same name, same price")
      // }
      // else if (results.length == 2) {
      //   res.send("same name, same price2")
      // }

      else if (results.length == 1) {
        if (results[0].itemName == req.body.itemName && results[0].itemPrice == req.body.itemPrice) {
          res.send("same name, same price")
        } else if (results[0].itemName == req.body.itemName) {
          res.send("same name")
        } else if (results[0].itemPrice == req.body.itemPrice) {
          res.send("same price")
        }
      } else if (results.length == 2) {
        res.send("same name, same price (2개)")
      }

    });
});
