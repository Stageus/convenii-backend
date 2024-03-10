const router = require("express").Router();

//productIdx 가져오기
router.get("/:productIdx", async (req, res, next) => {
    const { productIdx } = req.params;
    const result = {
        data: {},
    };
    try {
    } catch (err) {}
});

//모든 상품 가져오기
router.get("/all", async (req, res, next) => {
    try {
    } catch (err) {}
});
//회사 행사페이지 상품 가져오기
router.get("/company/:companyIdx", async (req, res, next) => {
    try {
    } catch (err) {}
});

//상품 검색하기
router.get("/company/search", async (req, res, next) => {
    try {
    } catch (err) {}
});

//상품 추가하기
router.post("/", async (req, res, next) => {
    try {
    } catch (err) {}
});

// productIdx 수정하기
router.put("/:productIdx", async (req, res, next) => {
    try {
    } catch (err) {}
});

//productIdx 삭제하기
router.delete("/:productIdx", async (req, res, next) => {
    try {
    } catch (err) {}
});
module.exports = router;
