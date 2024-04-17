const router = require("express").Router();

const uploadImg = require("../util/middleware/uploadImg");
const wrapper = require("../util/module/wrapper");
const patternTest = require("../util/module/patternTest");
const GetProductsDto = require("./dto/GetProductsDto");
const ProductResponseDto = require("./dto/responseDto/ProductResponseDto");
const { getProductsAll, getProductByIdx, createProduct } = require("./product.service");
const GetProductsByCompanyDto = require("./dto/GetProductsByCompanyDto");
const GetProductsBySearchDto = require("./dto/GetProductsBySearchDto");
const GetProductByIdxDto = require("./dto/GetProductByIdxDto");
const CreateProductDto = require("./dto/CreateProductDto");
const accountAuth = require("../util/middleware/accountAuth");

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
    accountAuth(),
    wrapper(async (req, res, next) => {
        const user = req.user;

        const productList = await getProductsAll(GetProductsDto.createDto(user, req.query));

        res.status(200).send(ProductResponseDto.create(productList, user).products());
    })
);

//회사 행사페이지 상품 가져오기
router.get(
    "/company/:companyIdx",
    accountAuth(),
    wrapper(async (req, res, next) => {
        const user = req.user;

        const productList = await getProductsAll(GetProductsByCompanyDto.createDto(user, req.query, req.params));

        res.status(200).send(ProductResponseDto.create(productList, user).products());
    })
);

//상품 검색하기
router.get(
    "/search",
    accountAuth(),
    wrapper(async (req, res, next) => {
        const user = req.user;
        const productList = await getProductsAll(GetProductsBySearchDto.createDto(user, req.query));
        res.status(200).send(ProductResponseDto.create(productList, user).products());
    })
);

//productIdx 가져오기
router.get(
    "/:productIdx",
    accountAuth(),
    wrapper(async (req, res, next) => {
        const user = req.user;
        const productList = await getProductByIdx(GetProductByIdxDto.createDto(user, req.params));
        res.status(200).send(ProductResponseDto.create(productList, user).product());
    })
);
//상품 추가하기
router.post(
    "/",
    uploadImg,
    accountAuth(),
    wrapper(async (req, res, next) => {
        await createProduct(CreateProductDto.createDto(req.file, req.body));

        res.status(201).send();
    })
);

// productIdx 수정하기
router.put(
    "/:productIdx",
    uploadImg,
    accountAuth(2),
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
    accountAuth(2),
    wrapper(async (req, res, next) => {
        const { productIdx } = req.params;

        await deleteProduct(productIdx);
        res.status(204).send();
    })
);

module.exports = router;
