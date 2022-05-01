const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios").default;
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var key = "bf4e7ce9335d4e468ca91e0009278035";
var endpoint = "https://api.cognitive.microsofttranslator.com";

var location = "eastus";
const TRANSLATE_END_POINT =
  "https://rithesh-si.cognitiveservices.azure.com/translator/text/batch/v1.0";

const TRANSLATED_DOC =
  "https://docssi.blob.core.windows.net/translated/document.txt?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2022-05-02T01:41:16Z&st=2022-05-01T17:41:16Z&spr=https&sig=rL%2BbGQaT6j6fmiBj%2Bf6O23pQjDlTyJ5CCcw%2FhFoNnsg%3D";

app.get("/text", (req, res) => {
  let textArr = req.body;
  let from = req.query.from;
  let to = req.query.to;
  axios({
    baseURL: endpoint,
    url: "/translate",
    method: "post",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Ocp-Apim-Subscription-Region": location,
      "Content-type": "application/json",
      "X-ClientTraceId": uuidv4().toString(),
    },
    params: {
      "api-version": "3.0",
      from: from,
      to: to,
    },
    data: textArr,
    responseType: "json",
  })
    .then(function (response) {
      res.json(response.data);
    })
    .catch((e) => {
      console.log(e);
    });
});

app.get("/text-detect", (req, res) => {
  let textArr = req.body;
  axios({
    baseURL: endpoint,
    url: "/detect",
    method: "post",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Ocp-Apim-Subscription-Region": location,
      "Content-type": "application/json",
      "X-ClientTraceId": uuidv4().toString(),
    },
    params: {
      "api-version": "3.0",
    },
    data: textArr,
    responseType: "json",
  }).then(function (response) {
    res.json(response.data);
  });
});

app.post("/document-translate", (req, res) => {
  let toLang = req.query.to;

  let body = {
    inputs: [
      {
        source: {
          sourceUrl:
            "https://docssi.blob.core.windows.net/input?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2022-05-02T01:41:16Z&st=2022-05-01T17:41:16Z&spr=https&sig=rL%2BbGQaT6j6fmiBj%2Bf6O23pQjDlTyJ5CCcw%2FhFoNnsg%3D",
        },
        targets: [
          {
            targetUrl:
              "https://docssi.blob.core.windows.net/translated?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2022-05-02T01:41:16Z&st=2022-05-01T17:41:16Z&spr=https&sig=rL%2BbGQaT6j6fmiBj%2Bf6O23pQjDlTyJ5CCcw%2FhFoNnsg%3D",
            language: toLang,
          },
        ],
      },
    ],
  };
  axios({
    baseURL: TRANSLATE_END_POINT,
    url: "/batches",
    method: "post",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
    },
    data: body,
    responseType: "json",
  }).then(function (response) {
    if (response.status == 202) {
      return res.send("Translated the file");
    }
  });
});

app.get("/doc-content", (req, res) => {
  axios
    .get(TRANSLATED_DOC, {
      headers: {
        "Ocp-Apim-Subscription-Key": key,
      },
    })
    .then((resp1) => {
      res.send(resp1.data);
    })
    .catch((e) => {
      console.log(e);
    });
});
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
