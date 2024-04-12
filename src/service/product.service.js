const CreateProductDto = require("../dto/CreateProductDto");
const CreateEventHistoryDto = require("../dto/CreateEventHistoryDto");
const { getProductData, getEventHistoryData, getProductsData, getProductsDataByCompanyIdx, getProductsDataBySearch, postProductData, checkProductExistByIdx, putProductData } = require("../repository/productRepository");
const { NotFoundException, BadRequestException, ServerError } = require("../modules/Exception");
const EventHistory = require("../entity/EventHistory");
const Product = require("../entity/Product");
const productEventWrapper = require("../modules/productEventWrapper");
const e = require("express");

const keywordPattern = /^(null|[d가-힣A-Za-z]{0,30})$/;
const COMPANY_SIZE = 3;
/**
 *
 * @param {req.user} user
 * @param {number} productIdx
 * @returns { Promise<
 *      Product,
 *      EventHistory
 * >}
 */
const getProductByIdx = async (user, productIdx) => {
    //productData
    const productData = await getProductData(user.idx, productIdx);
    if (!productData) {
        throw new NotFoundException("Cannot find product");
    }

    const productDto = new CreateProductDto(productData);
    const product = productDto.createProduct();

    // eventHistoryData
    const eventHistoryData = await getEventHistoryData(productIdx);
    if (!eventHistoryData) {
        throw new NotFoundException("Cannot find product's eventHistory ");
    }

    //data transfer
    const eventHistory = [];
    eventHistoryData.forEach((data) => {
        const eventHistoryDto = new CreateEventHistoryDto(data);
        eventHistory.push(eventHistoryDto.createEventHistory());
    });

    return {
        product,
        eventHistory,
    };
};

/**
 *
 * @param {req.user} user
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
 * @param {req.user} user
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
 * @param {req.user} user
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
    if (!keywordPattern.test(keyword)) {
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

    if (!(await postProductData(categoryIdx, name, price, file, companyIdxArray, eventIdxArray, eventPriceArray))) {
        throw new ServerError("unexpected error occur");
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

    if (!(await putProductData(productIdx, categoryIdx, name, price, file, companyIdxArray, eventIdxArray, eventPriceArray))) {
        throw new ServerError("unexpected error occur");
    }
    return;
};
module.exports = { getProductByIdx, getProductAll, getProductsByCompanyIdx, getProductsBySearch, postProduct, putProduct };
