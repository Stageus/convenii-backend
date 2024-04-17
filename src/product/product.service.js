const { NotFoundException } = require("../util/module/Exception");
const CreateProductDto = require("./dto/CreateProductDto");
const GetProductByIdxDto = require("./dto/GetProductByIdxDto");
const GetProductsByCompanyDto = require("./dto/GetProductsByCompanyDto");
const GetProductsBySearchDto = require("./dto/GetProductsBySearchDto");
const GetProductsDto = require("./dto/GetProductsDto");
const ProductByIdxEntity = require("./entity/ProductByIdxEntity");
const ProductEntity = require("./entity/ProductEntity");
const { selectProducts, selectProductByIdx } = require("./product.repository");
const { selectEvents } = require("../event/event.repository");

/**
 * @typedef {GetProductsDto|| GetProductsByCompanyDto || GetProductsBySearchDto}  ProductsDto
 */

/**
 *
 * @param {ProductsDto} ProductsDto
 * @returns {Promise<{
 *  productList: ProductEntity[],
 * }}
 */
const getProductsAll = async (productsDto) => {
    const productList = await selectProducts(productsDto);
    if (productList.length === 0) {
        throw NotFoundException("no products");
    }

    const eventList = await selectEvents();
    if (eventList.length === 0) {
        throw NotFoundException("no events");
    }

    const eventMap = eventList.reduce((acc, event) => {
        acc[event.productIdx] = event.eventInfo;
        return acc;
    }, {});

    const productsWithEvents = productList
        .filter((product) => eventMap[product.idx])
        .map((product) => ({
            ...product,
            events: eventMap[product.idx],
        }));

    return productsWithEvents.map((product) => ProductEntity.createEntityFromDao(product));
};

/**
 *
 * @param {GetProductByIdxDto} getProductByIdxDto
 * @returns {Promise<ProductEntity>}
 */
const getProductByIdx = async (getProductByIdxDto) => {
    const product = await selectProductByIdx(getProductByIdxDto);

    if (!product) {
        throw new NotFoundException("Cannot find product");
    }

    return ProductByIdxEntity.createEntityFromDao(product);
};

const createProduct = async (createProductDto) => {};
module.exports = {
    getProductsAll,
    getProductByIdx,
};
