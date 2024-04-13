const GetProductsByCompanyDto = require("./dto/GetProductsByCompanyDto");
const GetProductsBySearchDto = require("./dto/GetProductsBySearchDto");
const GetProductsDto = require("./dto/GetProductsDto");
const ProductEntity = require("./entity/ProductEntity");
const { selectProducts, selectProductsByCompany, selectProductsBySearch } = require("./product.repository");

/**
 *
 * @param {GetProductsDto} getProductsDto
 * @returns {Promise<{
 *  productList: ProductEntity[],
 * }}
 */
const getProductsAll = async (getProductsDto) => {
    const productList = await selectProducts(getProductsDto);

    return {
        productList: productList.map((product) => ProductEntity.createEntityFromDao(product)),
    };
};

/**
 *
 * @param {GetProductsByCompanyDto} getProductsByCompanyDto
 * @returns {Promise<{
 *  productList: ProductEntity[],
 * }}
 */
const getProductsByCompany = async (getProductsByCompanyDto) => {
    const productList = await selectProductsByCompany(getProductsByCompanyDto);
    return {
        productList: productList.map((product) => ProductEntity.createEntityFromDao(product)),
    };
};

/**
 *
 * @param {GetProductsBySearchDto} getProductsBySearchDto
 * @returns {Promise<{
 *  productList: ProductEntity[],
 * }}
 */
const getProductsBySearch = async (getProductsBySearchDto) => {
    const productList = await selectProductsBySearch(getProductsBySearchDto);
    return {
        productList: productList.map((product) => ProductEntity.createEntityFromDao(product)),
    };
};

module.exports = {
    getProductsAll,
    getProductsByCompany,
    getProductsBySearch,
};
