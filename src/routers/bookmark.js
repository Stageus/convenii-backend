const router = require("express").Router();

// 북마크 등록하기
router.post("/", async (req, res, next) => {
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
