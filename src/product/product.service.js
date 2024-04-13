const GetProductsDto = require("./dto/GetProductsDto");
const ProductEntity = require("./entity/ProductEntity");
const PAGESIZEOPTION = 10;
/**
 *
 * @param {GetProductsDto} getProductsDto
 * @returns {Promise<{
 *  productList: ProductEntity[],
 * }}
 */
const getProductsAll = async (getProductsDto) => {
    const productList = await selectProducts(getProductsDto, PAGESIZEOPTION);

    return {
        productList: productList.map((product) => ProductEntity.createProductEntityFromDao(product)),
    };
};

module.exports = {
    getProductsAll,
};
