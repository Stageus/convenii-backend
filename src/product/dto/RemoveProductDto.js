class RemoveProductDto {
    /**
     * @type {number}
     */
    productIdx;

    /**
     *
     * @param {{
     *  productIdx:number
     * }} data
     */
    constructor(data) {
        this.productIdx = data.productIdx;
    }

    /**
     *
     * @param {{
     *  productIdx : number
     * }} params
     * @returns {RemoveProductDto}
     */
    static createDto(params) {
        return new RemoveProductDto({
            productIdx: params.productIdx,
        });
    }
}

module.exports = RemoveProductDto;
