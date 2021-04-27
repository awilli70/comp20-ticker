require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs')
var readline = require('readline')

/* GET home page. */
router.get('/insertDoc', async (req, res, next) => {
  var client = req.client
  try {
    const csvreader = 
      fs.readFile(__dirname + '/../companies.csv', {"encoding" : "utf-8"}, (err, data) => {
        if (err) throw err;
        data = data.split('\r\n')
        var headers = data[0].split(',')
        data.shift()
        data.pop();
        for (let str in data) {
          var strObj = {}
          let strArr = data[str].split(',')
          for (let idx in headers) {
            strObj[headers[idx]] = strArr[idx]
          }
          data[str] = strObj
        }
        insertMany(client, "companies", data)
        res.send(data)
      });
  } catch (e) {
    next(e);
  }
});

router.post('/tickerInfo', async (req, res, next) => {
  var client = req.client
  try {
    let inputType = req.body.inputType
    let text = req.body.textInput
    let header = "<h1>Companies and Tickers</h1>"
    if (inputType === "Ticker") {
      const cursor = await client.db(process.env.DB)
                                 .collection("companies").find({"Ticker": text})
      const results = await cursor.toArray();
      let htmlstr = ""
      for (let result of results) {
        htmlstr += `<p>${result.Company}, ${result.Ticker}</p>`
      }
      if (htmlstr == '') {
        htmlstr = "<h2>No matches found</h2>"
      }
      res.send(header + htmlstr)
    } else {
      const cursor = await client.db(process.env.DB)
                                 .collection("companies").find({"Company": text})
      const results = await cursor.toArray();
      let htmlstr = ""
      for (let result of results) {
        htmlstr += `<p>${result.Company}, ${result.Ticker}</p>`
      }
      if (htmlstr == '') {
        htmlstr = "<h2>No matches found</h2>"
      }
      res.send(header + htmlstr)
    }
  } catch (e) {
    next(e)
  }
})

async function insertMany(client, collection, data) {
  const cursor = await client.db(process.env.DB).collection(collection).find({})
  const results = await cursor.toArray();
  if (results !== []) {
    const insert = client.db(process.env.DB).collection(collection).insertMany(data);
  }
}

module.exports = router;
