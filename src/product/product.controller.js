const router = require("express").Router();

const checkCondition = require("../util/middleware/checkCondition");
const loginAuth = require("..//util/middleware/loginAuth");
const adminAuth = require("../util/middleware/adminAuth");
const checkAuthStatus = require("../util/middleware/checkAuthStatus");
const uploadImg = require("../util/middleware/uploadImg");
const wrapper = require("../util/module/wrapper");
const patternTest = require("../util/module/patternTest");
const GetProductsDto = require("./dto/GetProductsDto");
const ProductsAllResponseDto = require("./dto/responseDto/productsAllResponseDto");
const { getProductsAll, getProductsByCompany, getProductsBySearch } = require("./product.service");
const GetProductsByCompanyDto = require("./dto/GetProductsByCompanyDto");
const GetProductsBySearchDto = require("./dto/GetProductsBySearchDto");

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
        const productList = await getProductsAll(GetProductsDto.createDto(user, req.query));
        res.status(200).send(ProductsAllResponseDto.create(productList, user));
    })
);

//회사 행사페이지 상품 가져오기
router.get(
    "/company/:companyIdx",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        const user = req.user;
        const productList = await getProductsByCompany(GetProductsByCompanyDto.createDto(user, req.query, req.params));
        res.status(200).send(ProductsAllResponseDto.create(productList, user));
    })
);

//상품 검색하기
router.get(
    "/search",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        const user = req.user;
        const productList = await getProductsBySearch(GetProductsBySearchDto.createDto(user, req.query));
        res.status(200).send(ProductsAllResponseDto.create(productList, user));
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
