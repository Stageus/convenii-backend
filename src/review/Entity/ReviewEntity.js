module.exports = class ReviewEntity {
    /**
     * @type {number}
     */
    reviewIdx;

    /**
     * @type {number}
     */
    productIdx;

    /**
     * @type {string}
     */
    nickname;

    /**
     * @type {string}
     */
    content;

    /**
     * @type {string}
     */
    score;

    /**
     * @type {Date}
     */
    createdAt;

    /**
     *
     * @param {{
     *  reviewIdx: number,
     *  productIdx: number,
     *  nickname: string,
     *  content: string ,
     *  score: string,
     *  createdAt: Date
     * }} data
     */
    constructor(data) {
        this.reviewIdx = data.reviewIdx;
        this.productIdx = data.productIdx;
        this.nickname = data.nickname;
        this.content = data.content;
        this.score = data.score;
        this.createdAt = data.createdAt;
    }

    static createEntityFromDao(data) {
        return new ReviewEntity({
            reviewIdx: data.reviewIdx,
            productIdx: data.productIdx,
            nickname: data.nickname,
            content: data.content,
            score: data.score,
            createdAt: data.createdAt,
        });
    }
};
