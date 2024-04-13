class getProductsDto {
    account;

    /**
     * @type {number}
     */
    page;

    /**
     *
     * @param {{
     *  account: Account,
     *  page: number
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.page = data.page;
    }
    validate() {}

    static createGetProductsDto(user, query) {}
}
