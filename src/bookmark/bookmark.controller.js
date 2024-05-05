const router = require("express").Router();

const ProductResponseDto = require("../product/dto/responseDto/ProductResponseDto");
const accountAuth = require("../util/middleware/accountAuth");
const { NotFoundException } = require("../util/module/Exception");
const nullResponse = require("../util/module/nullResponse");
const wrapper = require("../util/module/wrapper");
const { createBookmark, getBookmarkedProduct, removeBookmark } = require("./bookmark.service");
const CreateBookmarkDto = require("./dto/CreateBookmarkDto");
const GetBookmarkedProductDto = require("./dto/GetBookmarkedProductDto");
const RemoveBookmarkDto = require("./dto/RemoveBookmarkDto");

// 북마크 등록하기
router.post(
    "/product/:productIdx",
    accountAuth(1),
    wrapper(async (req, res, next) => {
        const user = req.user;
        await createBookmark(CreateBookmarkDto.createDto(user, req.params));
        res.status(201).send(nullResponse);
    })
);

// 북마크 가져오기
router.get(
    "/all",
    accountAuth(1),
    wrapper(async (req, res, next) => {
        const user = req.user;
        try {
            const productList = await getBookmarkedProduct(GetBookmarkedProductDto.createDto(user, req.query));
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

// 북마크 삭제하기
router.delete(
    "/product/:productIdx",
    accountAuth(1),
    wrapper(async (req, res, next) => {
        const user = req.user;
        await removeBookmark(RemoveBookmarkDto.createDto(user, req.params));
        res.status(201).send(nullResponse);
    })
);

module.exports = router;
