const router = require("express").Router();
const loginAuth = require("../middlewares/loginAuth");
const pgPool = require("../modules/pgPool");
const wrapper = require("../modules/wrapper");
const query = require("../modules/query");
const { UnauthorizedException, BadRequestException } = require("../modules/Exception");

// 북마크 등록하기
router.post(
    "/product/:productIdx",
    loginAuth,
    wrapper(async (req, res, next) => {
        const { productIdx } = req.params;
        const user = req.user;

        res.status(201).send();
    })
);

// 북마크 가져오기
router.get(
    "/all",
    loginAuth,
    wrapper(async (req, res, next) => {
        const user = req.user;
        const { page } = req.query;
        const pageSizeOption = 10;

        if (!page || isNaN(parseInt(page, 10)) || page <= 0) {
            throw new BadRequestException("page 입력 오류");
        }

        res.status(200).send({
            data: products,
        });
    })
);

// 북마크 삭제하기
router.delete(
    "/product/:productIdx",
    loginAuth,
    wrapper(async (req, res, next) => {
        res.status(201).send();
    })
);

module.exports = router;
