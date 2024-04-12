const CreateEventHistoryDto = require("../dto/CreateEventHistoryDto");
const { getProductDataByIdx, getProductsDataByCompanyIdx, getProductsDataBySearch, postProductData, checkProductExistByIdx, putProductData, deleteProductData } = require("../repository/productRepository");
const { NotFoundException, BadRequestException, ServerError } = require("../modules/Exception");
const EventHistory = require("../entity/EventHistory");
const Product = require("../entity/Product");
const productEventWrapper = require("../modules/productEventWrapper");

const pgPool = require("../modules/pgPool");
const { postEventsByProductIdx, deleteCurrentMonthEventsByProductIdx, getEventHistoryData } = require("../repository/eventRepository");
const patternTest = require("../modules/patternTest");
const ProductBO = require("../bo/ProductBO");
const EventHistoryBO = require("../bo/EventHistoryBO");
const ProductResponseDto = require("../dto/productDto/ProductResponseDto");
const EventHistoryResponseDto = require("../dto/eventDto/EventHistoryResponseDto");
const Account = require("../entity/Account");

const COMPANY_SIZE = 3;
/**
 *
 * @param {Account} user
 * @param {number} productIdx
 * @returns { Promise<
 *      Product,
 *      EventHistory
 * >}
 */
const getProductByIdx = async (user, productIdx) => {
    //productData
    const productData = await getProductDataByIdx(user.idx, productIdx);
    const productBO = new ProductBO(productData);

    // eventHistoryData
    const eventHistoryData = await getEventHistoryData(productIdx);
    console.log(eventHistoryData);
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
 * @returns {Promise<Array<{
 *          product:Product
 *          events:EventHistory
 *      }
 * >}
 */
const getProductAll = async (user, page) => {
    const pageSizeOption = 10;
    if (!page || isNaN(parseInt(page, 10)) || page <= 0) {
        throw new BadRequestException("page 입력 오류");
    }

    const productsData = await getProductsData(user.idx, page, pageSizeOption);
    if (!productsData) {
        throw new BadRequestException("Cannot find products");
    }

    return await productEventWrapper(productsData);
};

/**
 *
 * @param {Account} user
 * @param {number} companyIdx
 * @param {number} page
 * @param {string} option
 * @returns {Promise<Array<{
 *          product:Product
 *          events:EventHistory
 *      }
 * >}
 */
const getProductsByCompanyIdx = async (user, companyIdx, page, option) => {
    let pageSizeOption = 10;
    let offset = (parseInt(page) - 1) * pageSizeOption;
    if (!companyIdx || isNaN(parseInt(companyIdx, 10)) || companyIdx <= 0 || companyIdx > COMPANY_SIZE) {
        throw new BadRequestException("companyIdx 입력 오류");
    }
    if (!page || isNaN(parseInt(page, 10)) || page <= 0) {
        throw new BadRequestException("page 입력 오류");
    }
    if (option !== "main" && option !== "all") {
        throw new BadRequestException("option 입력 오류");
    }
    if (option === "main") {
        pageSizeOption = 3;
        offset = 0;
    }

    const productsData = await getProductsDataByCompanyIdx(user.idx, companyIdx, pageSizeOption, offset, COMPANY_SIZE);
    if (!productsData) {
        throw new NotFoundException("Cannot find products");
    }

    return await productEventWrapper(productsData);
};
/**
 *
 * @param {Account} user
 * @param {string} keyword
 * @param {Array<number>} eventFilter
 * @param {Array<number>} categoryFilter
 * @param {number} page
 * @returns {Promise<Array<{
 *          product:Product
 *          events:EventHistory
 *      }
 * >}
 */
const getProductsBySearch = async (user, keyword, categoryFilter, eventFilter, page) => {
    const pageSizeOption = 10;
    if (!patternTest("keyword", keyword)) {
        throw new BadRequestException("keyword 입력 오류");
    }
    if (!page || isNaN(parseInt(page, 10)) || page <= 0) {
        throw new BadRequestException("page 입력 오류");
    }
    if (!eventFilter) {
        eventFilter = [1, 2, 3, 4, 5, 6];
    }
    if (!categoryFilter) {
        categoryFilter = [1, 2, 3, 4, 5, 6];
    }
    const productsData = await getProductsDataBySearch(user.idx, keyword, categoryFilter, eventFilter, pageSizeOption, page);

    return await productEventWrapper(productsData);
};

/**
 *
 * @param {number} categoryIdx
 * @param {string} name
 * @param {string} price
 * @param {Array} eventInfo
 * @param {req.file} file
 * @returns {Promise<void>}
 */
const postProduct = async (categoryIdx, name, price, eventInfo, file) => {
    const companyIdxArray = [];
    const eventIdxArray = [];
    const eventPriceArray = [];
    if (typeof categoryIdx !== "string" || parseInt(categoryIdx) < 0) {
        throw new BadRequestException("categoryIdx 오류");
    }
    if (typeof name !== "string" || name.trim().length === 0) {
        throw new BadRequestException("name 오류");
    }
    if (typeof price !== "string" || parseInt(price) <= 0) {
        throw new BadRequestException("price 오류");
    }
    if (eventInfo.length === 0) {
        throw new BadRequestException("eventInfo 오류");
    }
    eventInfo.forEach((event) => {
        //companyIdx가 없으면 넣지 않는다
        if (event.companyIdx && event.companyIdx > 0 && event.companyIdx <= COMPANY_SIZE) {
            companyIdxArray.push(event.companyIdx);
            eventIdxArray.push(event.eventIdx);
            if (!event.eventPrice) {
                event.eventPrice = null;
            }
            eventPriceArray.push(event.eventPrice);
        }
    });
    const client = await pgPool.connect();
    try {
        await client.query("BEGIN");
        const newProductIdx = await postProductData(categoryIdx, name, price, file, client);
        await postEventsByProductIdx(newProductIdx, companyIdxArray, eventIdxArray, eventPriceArray, client);
        await client.query("COMMIT");
    } catch (err) {
        client.query("ROLLBACK");
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
 * @param {Array} eventInfo
 * @param {req.file} file
 * @returns {Promise<void>}
 */
const putProduct = async (productIdx, categoryIdx, name, price, eventInfo, file) => {
    const companyIdxArray = [];
    const eventIdxArray = [];
    const eventPriceArray = [];
    if (typeof categoryIdx !== "string" || parseInt(categoryIdx) < 0) {
        throw new BadRequestException("categoryIdx 오류");
    }
    if (typeof name !== "string" || name.trim().length === 0) {
        throw new BadRequestException("name 오류");
    }
    if (typeof price !== "string" || parseInt(price) <= 0) {
        throw new BadRequestException("price 오류");
    }
    if (eventInfo.length === 0) {
        throw new BadRequestException("eventInfo 오류");
    }
    eventInfo.forEach((event) => {
        //companyIdx가 없으면 넣지 않는다
        if (event.companyIdx && event.companyIdx > 0 && event.companyIdx <= COMPANY_SIZE) {
            companyIdxArray.push(event.companyIdx);
            eventIdxArray.push(event.eventIdx);
            if (!event.eventPrice) {
                event.eventPrice = null;
            }
            eventPriceArray.push(event.eventPrice);
        }
    });

    if (!(await checkProductExistByIdx(productIdx))) {
        throw new BadRequestException("productIdx에 해당하는 product가 없음");
    }
    const client = await pgPool.connect();
    try {
        await client.query("BEGIN");
        await putProductData(productIdx, categoryIdx, name, price, file, client);
        //현재 행사 삭제하고 다시 넣기
        await deleteCurrentMonthEventsByProductIdx(productIdx, client);
        await postEventsByProductIdx(productIdx, companyIdxArray, eventIdxArray, eventPriceArray, client);

        await client.query("COMMIT");
    } catch (err) {
        client.query("ROLLBACK");
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
    getProductAll,
    getProductsByCompanyIdx,
    getProductsBySearch,
    postProduct,
    putProduct,
    deleteProduct,
};
