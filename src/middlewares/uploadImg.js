const multerConfig = require("../config/multerConfig");
const multer = require("multer");
const upload = multer(multerConfig);
const uploadArray = upload.single("images");

module.exports = (req, res, next) => {
    uploadArray(req, res, (err) => {
        if (err) {
            console.log("ERR", err);
            next(err);
        } else {
            next();
        }
    });
};
