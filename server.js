require("dotenv").config();
//Import--------------------------------------------//
const express = require("express");
const https = require("https");
const app = express();

const accountApi = require("./src/account/account.controller");
// const bookmarkApi = require("./src/routers/bookmark");
const productApi = require("./src/product/product.controller");
const reviewApi = require("./src/review/review.controller");

const morganLogger = require("./src/util/middleware/morganLogger");
//config-------------------------------------------------//

const { HTTP_PORT, HTTPS_PORT } = require("./src/config/portConfig");
//const httpsConfig = require("./src/config/httpsConfig");
const { Exception } = require("./src/util/module/Exception");

//middleWare--------------------------------------------//
app.use(express.json());
app.use(morganLogger);
//Api---------------------------------------------------//

app.use("/account", accountApi);
// app.use("/bookmark", bookmarkApi);
app.use("/product", productApi);
app.use("/review", reviewApi);

//error_handler---------------------------------//
app.use((err, req, res, next) => {
    console.log(err);
    if (err instanceof Exception) {
        return res.status(err.status).send({
            message: err.message,
        });
    }
    if (err.status) {
        return res.status(err.status).send(err.message);
    }

    res.status(500).send("500 error, something wrong");
});

//---------------------------listener--------------------------------------///
app.listen(HTTP_PORT, () => {
    console.log(`${HTTP_PORT}번에서 HTTP 웹서버 실행`);
});
// https.createServer(httpConfig, app).listen(HTTPS_PORT, () => {
//     console.log(`${HTTPS_PORT}번에서 HTTPS 웹서버 실행`);
// });
