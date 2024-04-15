const { NotFoundException } = require("../util/module/Exception");
const CreateProductDto = require("./dto/CreateProductDto");
const GetProductByIdxDto = require("./dto/GetProductByIdxDto");
const GetProductsByCompanyDto = require("./dto/GetProductsByCompanyDto");
const GetProductsBySearchDto = require("./dto/GetProductsBySearchDto");
const GetProductsDto = require("./dto/GetProductsDto");
const ProductEntity = require("./entity/ProductEntity");
const { selectProducts, selectProductByIdx } = require("./product.repository");

/**
 *
 * @param {GetProductsDto} getProductsDto
 * @returns {Promise<{
 *  productList: ProductEntity[],
 * }}
 */
const getProductsAll = async (getProductsDto) => {
    const productList = await selectProducts(getProductsDto);

    if (productList.length === 0) {
        throw NotFoundException("no products");
    }

    return productList.map((product) => ProductEntity.createEntityFromDao(product));
};

/**
 *
 * @param {GetProductsByCompanyDto} getProductsByCompanyDto
 * @returns {Promise<{
 *  productList: ProductEntity[],
 * }}
 */
const getProductsByCompany = async (getProductsByCompanyDto) => {
    const productList = await selectProducts(getProductsByCompanyDto);

    if (productList.length === 0) {
        throw NotFoundException("no products");
    }

    return productList.map((product) => ProductEntity.createEntityFromDao(product));
};

/**
 *
 * @param {GetProductsBySearchDto} getProductsBySearchDto
 * @returns {Promise<{
 *  productList: ProductEntity[],
 * }}
 */
const getProductsBySearch = async (getProductsBySearchDto) => {
    const productList = await selectProducts(getProductsBySearchDto);

    if (productList.length === 0) {
        throw NotFoundException("no products");
    }

    return productList.map((product) => ProductEntity.createEntityFromDao(product));
};

/**
 *
 * @param {GetProductByIdxDto} getProductByIdxDto
 * @returns {Promise<ProductEntity>}
 */
const getProductByIdx = async (getProductByIdxDto, selectProductByIdx = selectProductByIdx) => {
    const product = await selectProductByIdx(getProductByIdxDto);

    if (!product) {
        throw new NotFoundException("Cannot find proudct");
    }

    return ProductEntity.createEntityFromDao(product);
};

const createProduct = async (createProductDto) => {};
module.exports = {
    getProductsAll,
    getProductsByCompany,
    getProductsBySearch,
    getProductByIdx,
};
