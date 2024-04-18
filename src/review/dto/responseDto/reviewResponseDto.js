const ReviewEntity = require("../../Entity/ReviewEntity");

class ReviewResponseDto {
    /**
     * @typedef {"false"|"true"|"expired"} LoginStatus
     */

    /**
     * @type {ReviewEntity[]}
     */
    data;

    /**
     * @type {LoginStatus}
     */
    authStatus;

    /**
     *
     * @param {
     *  data: any,
     *  authStatus: LoginStatus,
     * } param
     */
    constructor(param) {
        this.data = param.data;
        this.authStatus = param.authStatus;
    }

    /**
     *
     * @param {ProductEntity[]} productList
     * @param {Account} user
     */
    static createDto(productList, user) {
        return new ReviewResponseDto({
            data: {
                reviews: productList,
            },
            authStatus: user.authStatus,
        });
    }
}

module.exports = ReviewResponseDto;
