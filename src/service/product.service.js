const CreateEventHistoryDto = require("../dto/CreateEventHistoryDto");
const { getProductDataByIdx, postProductData, checkProductExistByIdx, putProductData, deleteProductData, getProductsWithEventsData, getProductsWithEventsDataByCompanyIdx, getProductsWithEventsDataBySearch } = require("../repository/productRepository");
const { NotFoundException, BadRequestException, ServerError } = require("../modules/Exception");
const EventHistory = require("../entity/EventHistory");
const Product = require("../entity/Product");

const pgPool = require("../modules/pgPool");
const { postEventsByProductIdx, deleteCurrentMonthEventsByProductIdx, getEventHistoryData, postEventsDataByProductIdx } = require("../repository/eventRepository");
const patternTest = require("../modules/patternTest");
const ProductBO = require("../bo/ProductBO");
const EventHistoryBO = require("../bo/EventHistoryBO");
const ProductResponseDto = require("../dto/productDto/ProductResponseDto");
const EventHistoryResponseDto = require("../dto/eventDto/EventHistoryResponseDto");
const Account = require("../entity/Account");
const ProductsWithEventsBO = require("../bo/ProductsWithEventsBO");
const ProductWithEventsResponseDto = require("../dto/productDto/ProductsWithEventsResponseDto");
const PostProductsWithEventsDataDto = require("../dto/productDto/PostProductDataDto");
const PostProductDataDto = require("../dto/productDto/PostProductDataDto");
const PostEventsDataDto = require("../dto/eventDto/PostEventsDataDto");

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
    getProductsWithEvents,
    getProductsWithEventsByCompanyIdx,
    getProductsWithEventsBySearch,
    postProduct,
    putProduct,
    deleteProduct,
};
