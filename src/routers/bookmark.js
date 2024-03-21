const router = require("express").Router();
const loginAuth = require("../middlewares/loginAuth");

// 북마크 등록하기
router.post("/product/:productIdx", loginAuth, async (req, res, next) => {
    const { productIdx } = req.params;
    try {

    } catch (error) {
        next(error);
    }
});

// 북마크 가져오기
router.get("/all", async (req, res, next) => {
    try {

    } catch (error) {
        next(error);
    }
});

// 북마크 삭제하기
router.delete("/", async (req, res, next) => {
    try {

    } catch (error) {
        next(error);
    }
});

module.exports = router;
