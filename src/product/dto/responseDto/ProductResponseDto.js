const ProductEntity = require("../../entity/ProductEntity");

class ProductResponseDto {
    /**
     * @typedef {"false"|"true"|"expired"} LoginStatus
     */

    /**
     * @type {ProductEntity[]}
     */
    data;

    /**
     * @type {LoginStatus}
     */
    authStatus;

    /**
     * @type {number}
     */
    rankIdx;
    /**
     *
     * @param {
     *  data: any,
     *  authStatus: LoginStatus,
     *  rankIdx: number
     * } param
     */
    constructor(param) {
        this.data = param.data;
        this.authStatus = param.authStatus;
        this.rankIdx = param.rankIdx;
    }

    /**
     *
     * @param {ProductEntity[]} productList
     * @param {Account} user
     */
    static create(productList, user) {
        return new ProductResponseDto({
            data: productList,
            authStatus: user.authStatus,
            rankIdx: user.rankIdx,
        });
    }

    product() {
        return {
            data: {
                product: this.data,
            },

            authStatus: this.authStatus,
            rankIdx: this.rankIdx,
        };
    }
    products() {
        return {
            data: {
                productList: this.data,
            },
            authStatus: this.authStatus,
            rankIdx: this.rankIdx,
        };
    }
}

module.exports = ProductResponseDto;
