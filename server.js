require("dotenv").config();
//Import--------------------------------------------//
const express = require("express");
const https = require("https");
const app = express();

const accountApi = require("./src/routers/account");
const bookmarkApi = require("./src/routers/bookmark");
const productApi = require("./src/routers/product");
const reviewApi = require("./src/routers/review");
//config-------------------------------------------------//

const { HTTP_PORT, HTTPS_PORT } = require("./src/config/portConfig");
const httpConfig = require("./src/config/httpsConfig");

//middleWare--------------------------------------------//

//Api---------------------------------------------------//

app.use("/account", accountApi);
app.use("/bookmark", bookmarkApi);
app.use("/product", productApi);
app.use("/review", reviewApi);

//error_handler---------------------------------//
app.use((err, req, res, next) => {
    if (err.status) {
        return res.status(err.status).send(err.message);
    }

    res.status(500).send("500 error, something wrong");
});

//---------------------------listener--------------------------------------///
app.listen(HTTP_PORT, () => {
    console.log(`${HTTP_PORT}번에서 HTTP 웹서버 실행`);
});
https.createServer(httpConfig, app).listen(HTTPS_PORT, () => {
    console.log(`${HTTPS_PORT}번에서 HTTPS 웹서버 실행`);
});
