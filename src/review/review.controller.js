const router = require("express").Router();

const wrapper = require("../util/module/wrapper");
const accountAuth = require("../util/middleware/accountAuth");
const { createReview, getReviews } = require("./review.service");
const CreateReviewDto = require("./dto/CreateReviewDto");
const GetReviewsDto = require("./dto/GetReviewsDto");
const ReviewResponseDto = require("./dto/responseDto/reviewResponseDto");

/////////////-------review---------////////////////////
//  POST/product/:productIdx        => 리뷰 추가하기
//  GET/product/:productIdx         =>  모든 리뷰 가져오기
/////////////////////////////////////////////////////

//productIdx의 리뷰 추가하기
router.post(
    "/product/:productIdx",
    accountAuth(1),
    wrapper(async (req, res, next) => {
        await createReview(CreateReviewDto.createDto(req.user, req.body, req.params));
        res.status(201).send();
    })
);

//productIdx의 모든 리뷰 가져오기
router.get(
    "/product/:productIdx",
    accountAuth(),
    wrapper(async (req, res, next) => {
        const reviewList = await getReviews(GetReviewsDto.createDto(req.query, req.params));

        res.status(200).send(ReviewResponseDto.createDto(reviewList, req.user));
    })
);

module.exports = router;
