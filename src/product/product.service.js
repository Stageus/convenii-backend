const GetProductsDto = require("./dto/GetProductsDto");

/**
 *
 * @param {GetProductsDto} getProductsDto
 */
const getProductsAll = async (getProductsDto) => {
    const products = await selectProducts(getProductsDto);
};

module.exports = {
    getProductsAll,
};
