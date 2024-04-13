const CreateEventHistoryDto = require("../dto/CreateEventHistoryDto");
const { getProductDataByIdx, postProductData, checkProductExistByIdx, putProductData, deleteProductData, getProductsWithEventsData, getProductsWithEventsDataByCompanyIdx, getProductsWithEventsDataBySearch } = require("../repository/productRepository");
const { NotFoundException, BadRequestException, ServerError } = require("../modules/Exception");
const EventHistory = require("../entity/EventHistory");
const Product = require("../entity/Product");

const pgPool = require("../modules/pgPool");
const { deleteCurrentMonthEventsByProductIdx, getEventHistoryData, postEventsDataByProductIdx } = require("../repository/eventRepository");
const patternTest = require("../modules/patternTest");
const ProductBO = require("../bo/ProductBO");
const EventHistoryBO = require("../bo/EventHistoryBO");
const ProductResponseDto = require("../dto/productDto/ProductResponseDto");
const EventHistoryResponseDto = require("../dto/eventDto/EventHistoryResponseDto");
const Account = require("../entity/Account");
const ProductsWithEventsBO = require("../bo/ProductsWithEventsBO");
const ProductWithEventsResponseDto = require("../dto/productDto/ProductsWithEventsResponseDto");
const PostProductDataDto = require("../dto/productDto/PostProductDataDto");
const PostEventsDataDto = require("../dto/eventDto/PostEventsDataDto");
const PutProductDataDto = require("../dto/productDto/PutProductDataDto");

const COMPANY_SIZE = 3;
/**
 *
 * @param {Account} user
 * @param {number} productIdx
 * @returns { Promise<
 *      ProductResponseDto,
 *      EventHistoryResponseDto
 * >}
 */
const getProductByIdx = async (user, productIdx) => {
    //productData
    const productData = await getProductDataByIdx(user.idx, productIdx);
    const productBO = new ProductBO(productData);

    // eventHistoryData
    const eventHistoryData = await getEventHistoryData(productIdx);
    const eventHistoryBO = new EventHistoryBO(eventHistoryData);

    return {
        product: new ProductResponseDto(productBO),
        eventHistory: new EventHistoryResponseDto(eventHistoryBO).spread(),
    };
};

/**
 *
 * @param {Account} user
 * @param {number} page
 * @returns {Promise<ProductWithEventsResponseDto>}
 */
const getProductsWithEvents = async (user, page) => {
    const pageSizeOption = 10;
    const productsWithEventsData = await getProductsWithEventsData(user.idx, page, pageSizeOption);
    const productsWithEventsBO = new ProductsWithEventsBO(productsWithEventsData);

    return new ProductWithEventsResponseDto(productsWithEventsBO);
};

/**
 *
 * @param {Account} user
 * @param {number} companyIdx
 * @param {number} page
 * @param {number} pageSizeOption
 * @param {number} offset
 * @returns {Promise<ProductWithEventsResponseDto>}
 */
const getProductsWithEventsByCompanyIdx = async (user, companyIdx, pageSizeOption, offset) => {
    const productsWithEventsData = await getProductsWithEventsDataByCompanyIdx({
        userIdx: user.idx,
        companyIdx: companyIdx,
        pageSizeOption: pageSizeOption,
        offset: offset,
        companySize: COMPANY_SIZE,
    });
    const productsWithEventsBO = new ProductsWithEventsBO(productsWithEventsData);

    return new ProductWithEventsResponseDto(productsWithEventsBO);
};
/**
 *
 * @param {Account} user
 * @param {string} keyword
 * @param {Array<number>} eventFilter
 * @param {Array<number>} categoryFilter
 * @param {number} page
 * @param {number} pageSizeOption
 * @returns {Promise<ProductWithEventsResponseDto>}
 */
const getProductsWithEventsBySearch = async (user, keyword, categoryFilter, eventFilter, page, pageSizeOption) => {
    const productsWithEventsData = await getProductsWithEventsDataBySearch({
        userIdx: user.idx,
        keyword: keyword,
        categoryFilter: categoryFilter,
        eventFilter: eventFilter,
        page: page,
        pageSizeOption: pageSizeOption,
    });

    const productsWithEventsBO = new ProductsWithEventsBO(productsWithEventsData);

    return new ProductWithEventsResponseDto(productsWithEventsBO);
};

/**
 *
 * @param {number} categoryIdx
 * @param {string} name
 * @param {string} price
 * @param {Array<Event>} events
 * @param {req.file} file
 * @returns {Promise<void>}
 */
const postProduct = async (categoryIdx, name, price, events, file) => {
    const client = await pgPool.connect();
    try {
        await client.query("BEGIN");

        const productDataDto = new PostProductDataDto({
            categoryIdx: categoryIdx,
            name: name,
            price: price,
            productImg: file.location,
        });
        const newProductIdx = await postProductData(productDataDto, client);

        const eventsDataDto = new PostEventsDataDto({
            productIdx: newProductIdx,
            events: events,
        });
        await postEventsDataByProductIdx(eventsDataDto, client);
        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }

    return;
};

/**
 *
 * @param {number} productIdx
 * @param {number} categoryIdx
 * @param {string} name
 * @param {string} price
 * @param {Array<Event>} events
 * @param {req.file} file
 * @returns {Promise<void>}
 */
const putProduct = async (productIdx, categoryIdx, name, price, events, file) => {
    if (!(await checkProductExistByIdx(productIdx))) {
        throw new BadRequestException("productIdx에 해당하는 product가 없음");
    }
    let newImg = null;
    if (typeof file !== "undefined") {
        newImg = file.location;
    }
    const client = await pgPool.connect();
    try {
        await client.query("BEGIN");
        //BO to DTo
        const putProductDataDto = new PutProductDataDto({
            productIdx: productIdx,
            categoryIdx: categoryIdx,
            name: name,
            price: price,
            productImg: newImg,
        });
        await putProductData(putProductDataDto, client);

        await deleteCurrentMonthEventsByProductIdx(productIdx, client);
        const eventsDataDto = new PostEventsDataDto({
            productIdx: productIdx,
            events: events,
        });
        await postEventsDataByProductIdx(eventsDataDto, client);
        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
    return;
};

/**
 *
 * @param {number} productIdx
 * @returns {Promise<boolean>}
 */
const deleteProduct = async (productIdx) => {
    await deleteProductData(productIdx);
    return;
};
module.exports = {
    getProductByIdx,
    getProductsWithEvents,
    getProductsWithEventsByCompanyIdx,
    getProductsWithEventsBySearch,
    postProduct,
    putProduct,
    deleteProduct,
};
