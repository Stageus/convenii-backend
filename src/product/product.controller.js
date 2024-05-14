const router = require("express").Router();

const uploadImg = require("../util/middleware/uploadImg");
const wrapper = require("../util/module/wrapper");
const GetProductsDto = require("./dto/GetProductsDto");
const ProductResponseDto = require("./dto/responseDto/ProductResponseDto");
const { getProductsAll, getProductByIdx, createProduct, amendProduct, removeProduct, getProductsMain, cacheMainProduct, getCachedMainProduct } = require("./product.service");
const GetProductsByCompanyDto = require("./dto/GetProductsByCompanyDto");
const GetProductsBySearchDto = require("./dto/GetProductsBySearchDto");
const GetProductByIdxDto = require("./dto/GetProductByIdxDto");
const CreateProductDto = require("./dto/CreateProductDto");
const accountAuth = require("../util/middleware/accountAuth");
const AmendProductDto = require("./dto/AmendProductDto");
const RemoveProductDto = require("./dto/RemoveProductDto");
const nullResponse = require("../util/module/nullResponse");
const { NotFoundException } = require("../util/module/Exception");
const GetCachedMainProductDto = require("./dto/GetCachedMainProductDto");

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
        try {
            const productList = await getProductsAll(GetProductsDto.createDto(user, req.query));
            res.status(200).send(ProductResponseDto.create(productList, user).products());
        } catch (err) {
            if (err instanceof NotFoundException) {
                res.status(200).send(ProductResponseDto.createNull(user));
            } else {
                throw err;
            }
        }
    })
);

//회사 행사페이지 상품 가져오기
router.get(
    "/company/:companyIdx",
    accountAuth(),
    wrapper(async (req, res, next) => {
        const user = req.user;

        try {
            const productList = await getCachedMainProduct(GetCachedMainProductDto.createDto(req.user, req.params, req.query));

            res.status(200).send(ProductResponseDto.create(productList, user).products());
        } catch (err) {
            if (err instanceof NotFoundException) {
                res.status(200).send(ProductResponseDto.createNull(user));
            } else {
                throw err;
            }
        }
    })
);

//상품 검색하기
router.get(
    "/search",
    accountAuth(),
    wrapper(async (req, res, next) => {
        const user = req.user;
        try {
            const productList = await getProductsAll(GetProductsBySearchDto.createDto(user, req.query));
            res.status(200).send(ProductResponseDto.create(productList, user).products());
        } catch (err) {
            if (err instanceof NotFoundException) {
                res.status(200).send(ProductResponseDto.createNull(user));
            } else {
                throw err;
            }
        }
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
    accountAuth(2),
    wrapper(async (req, res, next) => {
        await createProduct(CreateProductDto.createDto(req.file, req.body));

        res.status(201).send(nullResponse);
    })
);

// productIdx 수정하기
router.put(
    "/:productIdx",
    uploadImg,
    accountAuth(2),
    wrapper(async (req, res, next) => {
        await amendProduct(AmendProductDto.createDto(req.file, req.body, req.params));

        res.status(201).send(nullResponse);
    })
);

//productIdx 삭제하기
router.delete(
    "/:productIdx",
    accountAuth(2),
    wrapper(async (req, res, next) => {
        await removeProduct(RemoveProductDto.createDto(req.params));
        res.status(204).send(nullResponse);
    })
);

router.post(
    "/cache/company/:companyIdx",
    wrapper(async (req, res, next) => {
        const { companyIdx } = req.params;
        await cacheMainProduct({ companyIdx: companyIdx });
        res.status(204).send(nullResponse);
    })
);

module.exports = router;
