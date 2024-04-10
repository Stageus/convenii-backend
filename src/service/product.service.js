const CreateProductDto = require("../dto/CreateProductDto");
const CreateEventHistoryDto = require("../dto/CreateEventHistoryDto");
const { getProductData, getEventHistoryData, getProductsData, getProductsDataByCompanyIdx } = require("../repository/productRepository");
const { NotFoundException, BadRequestException } = require("../modules/Exception");
const EventHistory = require("../entity/EventHistory");
const Product = require("../entity/Product");
const productEventWrapper = require("../modules/productEventWrapper");
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
    console.log(productsData);
    return await productEventWrapper(productsData);
};
module.exports = { getProductByIdx, getProductAll, getProductsByCompanyIdx };
