const CreateProductDto = require("../dto/CreateProductDto");
const CreateEventHistoryDto = require("../dto/CreateEventHistoryDto");
const { getProductData, getEventHistoryData, getProductsData } = require("../repository/productRepository");
const { NotFoundException } = require("../modules/Exception");
const EventHistory = require("../entity/EventHistory");
const Product = require("../entity/Product");

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

    const data = [];

    productsData.forEach((productDataSet) => {
        const productData = {
            idx: productDataSet.idx,
            categoryIdx: productDataSet.categoryIdx,
            name: productDataSet.name,
            price: productDataSet.price,
            productImg: productDataSet.productImg,
            score: productDataSet.score,
            createdAt: productDataSet.createdAt,
            bookmarked: productDataSet.bookmarked,
        };

        const eventHistoryData = {
            month: productDataSet.month,
            events: productDataSet.events,
        };
        const productDto = new CreateProductDto(productData);
        const product = productDto.createProduct();

        const eventHistoryDto = new CreateEventHistoryDto(eventHistoryData);
        const eventHistory = eventHistoryDto.createEventHistory();

        data.push({
            product,
            eventHistory,
        });
    });

    return data;
};
module.exports = { getProductByIdx, getProductAll };
