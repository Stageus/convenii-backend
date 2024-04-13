const Account = require("../../../util/module/Account");
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
    static create(productList, user) {
        return new ProductResponseDto({
            data: productList,
            authStatus: user.authStatus,
        });
    }

    product() {
        return {
            data: {
                product: this.data,
            },

            authstatus: this.authStatus,
        };
    }
    products() {
        return {
            data: {
                productList: this.data,
            },
            authstatus: this.authStatus,
        };
    }
}

module.exports = ProductResponseDto;
