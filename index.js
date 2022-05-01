const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios").default;
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 3000;
const app = express();
require("dotenv").config();

/* swagger Info */
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    info: {
      title: "ITIS-6177-SI-FinalProject",
      version: "1.0.0",
      description: "Microsoft Azure Text Translator",
      contact: {
        name: "Rithesh Reddy",
        url: "https://github.com/RitheshReddy99",
        email: "ritheshreddy99@gmail.com",
      },
    },
    host: "localhost:3000",
    basePath: "/",
  },
  apis: ["./index.js"],
};

const specs = swaggerJsDoc(options);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

var key = process.env.keys;
console.log(key);
var endpoint = "https://api.cognitive.microsofttranslator.com";

var location = "eastus";
const TRANSLATE_END_POINT =
  "https://rithesh-si.cognitiveservices.azure.com/translator/text/batch/v1.0";

/**
 * @swagger
 * /text:
 *   post:
 *     tags:
 *       - Document
 *     description: Translates the document
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: from
 *         description: Input text.
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: en
 *       - name: to
 *         description: Translated langauge.
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: fr
 *       - name: body
 *         description: Text to be converted
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *           example: I am a human
 *     responses:
 *       200:
 *         description: Document Translated successfully.
 *       500:
 *         description: Message prompting error.
 */

app.post("/text", (req, res) => {
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

/**
 * @swagger
 * /text-detect:
 *   post:
 *     tags:
 *       - Document
 *     description: Translates the document
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Text to be converted
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *           example: I am a human
 *     responses:
 *       200:
 *         description: Document language found.
 *       500:
 *         description: Message prompting error.
 */

app.post("/text-detect", (req, res) => {
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

/**
 * @swagger
 * /document-translate:
 *   post:
 *     tags:
 *       - Document
 *     description: Translates the document
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: to
 *         description: Translated langauge code.
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: bg
 *     responses:
 *       200:
 *         description: Document Translated successfully.
 *       500:
 *         description: Message prompting error.
 */

app.post("/document-translate", (req, res) => {
  let toLang = req.query.to;

  let body = {
    inputs: [
      {
        source: {
          sourceUrl:
            "https://docssi.blob.core.windows.net/input?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2022-05-31T04:37:23Z&st=2022-05-01T20:37:23Z&spr=https&sig=J6HAmIVWKwIyilyjyfu4mysSurIEZs5FIc62s%2B32f60%3D",
        },
        targets: [
          {
            targetUrl: `https://docssi.blob.core.windows.net/translated?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2022-05-31T04:37:23Z&st=2022-05-01T20:37:23Z&spr=https&sig=J6HAmIVWKwIyilyjyfu4mysSurIEZs5FIc62s%2B32f60%3D`,
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
      return res.send(`Translated the file`);
    }
  });
});

/**
 * @swagger
 * /doc-content:
 *   get:
 *     tags:
 *       - Document
 *     description: Translates the document
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Translated document.
 *       500:
 *         description: Message prompting error.
 */
app.get("/doc-content", (req, res) => {
  let file = req.query.filename;
  let TRANSLATED_DOC = `https://docssi.blob.core.windows.net/translated/document.txt?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2022-05-31T04:37:23Z&st=2022-05-01T20:37:23Z&spr=https&sig=J6HAmIVWKwIyilyjyfu4mysSurIEZs5FIc62s%2B32f60%3D`;

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
