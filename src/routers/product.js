const router = require("express").Router();

const checkCondition = require("../middlewares/checkCondition");
const loginAuth = require("../middlewares/loginAuth");
const adminAuth = require("../middlewares/adminAuth");
const checkAuthStatus = require("../middlewares/checkAuthStatus");
const uploadImg = require("../middlewares/uploadImg");
const wrapper = require("../modules/wrapper");
const { getProductByIdx, getProductAll, getProductsByCompanyIdx, getProductsBySearch, postProduct, putProduct, deleteProduct, getProductsWithEvents, getProductsWithEventsByCompanyIdx } = require("../service/product.service");
const patternTest = require("../modules/patternTest");
const { getProductsWithEventsData } = require("../repository/productRepository");
const COMPANY_SIZE = 3;
/////////////---------------product---------/////////////////////
//  GET/all                       => 모든 상품 가져오기
//  GET/company/:companyIdx       => 회사별로 행사 정렬해서 가져오기
//  GET/search                    => 상품 검색
//  GET//:productIdx              =>비밀번호 찾기
//  POST/                          => 상품 추가하기
//  PUT/                           => 상품 정보 수정
//  DELETE/                        => 상품 삭제
/////////////////////////////////////////

//모든 상품 가져오기
router.get(
    "/all",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        const user = req.user;
        const { page } = req.query;
        if (!page || !patternTest("page", page)) {
            throw new BadRequestException("page 입력 오류");
        }

        res.status(200).send({
            data: await getProductsWithEvents(user, page),
            authStatus: user.isLogin,
        });
    })
);

//회사 행사페이지 상품 가져오기
router.get(
    "/company/:companyIdx",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        const { companyIdx } = req.params;
        const { page, option } = req.query;
        const user = req.user;
        let pageSizeOption = 10;
        let offset = (parseInt(page) - 1) * pageSizeOption;
        if (!companyIdx || !patternTest("idx", companyIdx) || companyIdx <= 0 || companyIdx > COMPANY_SIZE) {
            throw new BadRequestException("companyIdx 입력 오류");
        }
        if (!page || !patternTest("page", page)) {
            throw new BadRequestException("page 입력 오류");
        }

        if (option !== "main" && option !== "all") {
            throw new BadRequestException("option 입력 오류");
        }
        if (option === "main") {
            pageSizeOption = 3;
            offset = 0;
        }

        res.status(200).send({
            data: await getProductsWithEventsByCompanyIdx(user, companyIdx, pageSizeOption, offset),
            authStatus: user.isLogin,
        });
    })
);

//상품 검색하기
router.get(
    "/search",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        let { keyword, categoryFilter, eventFilter, page } = req.query;
        const user = req.user;

        res.status(200).send({
            data: await getProductsBySearch(user, keyword, categoryFilter, eventFilter, page),
            authStatus: user.isLogin,
        });
    })
);

//productIdx 가져오기
router.get(
    "/:productIdx",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        const { productIdx } = req.params;
        const user = req.user;

        res.status(200).send({
            data: await getProductByIdx(user, productIdx),
            authStatus: user.isLogin,
        });
    })
);
//상품 추가하기
router.post(
    "/",
    uploadImg,
    adminAuth,
    checkCondition("name"),
    checkCondition("price"),
    wrapper(async (req, res, next) => {
        const { categoryIdx, name, price, eventInfo } = req.body;

        await postProduct(categoryIdx, name, price, eventInfo, req.file);

        res.status(201).send();
    })
);

// productIdx 수정하기
router.put(
    "/:productIdx",
    uploadImg,
    adminAuth,
    wrapper(async (req, res, next) => {
        const { categoryIdx, name, price, eventInfo } = req.body;
        const { productIdx } = req.params;

        await putProduct(productIdx, categoryIdx, name, price, eventInfo, req.file);

        res.status(201).send();
    })
);

//productIdx 삭제하기
router.delete(
    "/:productIdx",
    adminAuth,
    wrapper(async (req, res, next) => {
        const { productIdx } = req.params;

        await deleteProduct(productIdx);
        res.status(204).send();
    })
);

module.exports = router;
