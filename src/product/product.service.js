const { NotFoundException } = require("../util/module/Exception");
const CreateProductDto = require("./dto/CreateProductDto");
const GetProductByIdxDto = require("./dto/GetProductByIdxDto");
const GetProductsByCompanyDto = require("./dto/GetProductsByCompanyDto");
const GetProductsBySearchDto = require("./dto/GetProductsBySearchDto");
const GetProductsDto = require("./dto/GetProductsDto");
const ProductByIdxEntity = require("./entity/ProductByIdxEntity");
const ProductEntity = require("./entity/ProductEntity");
const { selectProducts, selectProductByIdx, insertProduct, updateProduct, deleteProduct, selectProductsByCompany, selectProductsCountByCompany, selectProductsByIdxList } = require("./product.repository");
const { selectEvents, selectEventByProduct, insertEvent, deleteEvent } = require("../event/event.repository");
const pgPool = require("../util/module/pgPool");
const AmendProductDto = require("./dto/AmendProductDto");
const RemoveProductDto = require("./dto/RemoveProductDto");
const { setMainProduct, getMainProduct } = require("../account/redis.repository");

/**
 * @typedef {GetProductsDto|| GetProductsByCompanyDto || GetProductsBySearchDto}  ProductsDto
 */

//products일때는 events에 event[]로
//product by idx일때는 eventInfo 안에 events에 event[]로

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
        throw new NotFoundException("no products");
    }

    const eventList = await selectEvents();
    if (eventList.length === 0) {
        throw new NotFoundException("no events");
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
 * @param {ProductsDto} ProductsDto
 * @returns {Promise<{
 *  productList: ProductEntity[],
 * }}
 */
const getProductsMain = async (getProductsByCompanyDto) => {
    const productList = await selectProductsByCompany(getProductsByCompanyDto);
    if (productList.length === 0) {
        throw new NotFoundException("no products");
    }

    const eventList = await selectEvents();
    if (eventList.length === 0) {
        throw new NotFoundException("no events");
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
 * @returns {Promise<ProductByIdxEntity>}
 */
const getProductByIdx = async (getProductByIdxDto) => {
    const product = await selectProductByIdx(getProductByIdxDto);

    if (!product) {
        throw new NotFoundException("Cannot find product");
    }

    const eventWithMonth = await selectEventByProduct(getProductByIdxDto);

    if (eventWithMonth.length === 0) {
        throw new NotFoundException("Cannot find event");
    }

    return ProductByIdxEntity.createEntityFromDao(product, eventWithMonth);
};

/**
 *
 * @param {CreateProductDto} createProductDto
 * @returns {Promise<void>}
 */
const createProduct = async (createProductDto) => {
    const client = await pgPool.connect();

    try {
        await client.query("BEGIN");

        const productIdx = await insertProduct(createProductDto, client);

        await insertEvent(createProductDto.withProductIdx(productIdx), client);

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

/**
 *
 * @param {AmendProductDto} amendProductDto
 * @returns {Promise<void>}
 */
const amendProduct = async (amendProductDto) => {
    const client = await pgPool.connect();

    try {
        await client.query("BEGIN");

        await updateProduct(amendProductDto, client);

        await deleteEvent(amendProductDto, client);
        await insertEvent(amendProductDto, client);

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

/**
 *
 * @param {RemoveProductDto} removeProductDto
 * @returns {Promise<void>}
 */
const removeProduct = async (removeProductDto) => {
    await deleteProduct(removeProductDto);
};

const cacheMainProduct = async (cacheMainProductDto) => {
    const productCount = await selectProductsCountByCompany({
        companyIdx: cacheMainProductDto.companyIdx,
    });
    const mainList = await selectProductsByCompany({
        companyIdx: cacheMainProductDto.companyIdx,
        limit: 3,
        offset: 0,
    });
    const mainProductList = mainList.map((row) => row.productIdx);

    await setMainProduct({
        companyIdx: cacheMainProductDto.companyIdx,
        option: "main",
        productIdxList: mainProductList,
    });

    for (let i = 0; i < productCount; i = i + 10) {
        const productList = await selectProductsByCompany({
            companyIdx: cacheMainProductDto.companyIdx,
            limit: 10,
            offset: i,
        });
        const mainProductList = productList.map((row) => row.productIdx);

        await setMainProduct({
            companyIdx: cacheMainProductDto.companyIdx,
            option: i / 10 + 1,
            productIdxList: mainProductList,
        });
    }
};

const getCachedMainProduct = async (getCachedMainProductDto) => {
    const productIdxList = await getMainProduct({
        companyIdx: getCachedMainProductDto.companyIdx,
        option: getCachedMainProductDto.option,
    });

    const productList = await selectProductsByIdxList(getCachedMainProductDto.account, productIdxList.productIdxList);

    if (productList.length === 0) {
        throw new NotFoundException("no products");
    }

    const eventList = await selectEvents();
    if (eventList.length === 0) {
        throw new NotFoundException("no events");
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

module.exports = {
    getProductsAll,
    getProductByIdx,
    getProductsMain,
    createProduct,
    amendProduct,
    removeProduct,
    cacheMainProduct,
    getCachedMainProduct,
};
