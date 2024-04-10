const CreateProductDto = require("../dto/CreateProductDto");
const CreateEventHistoryDto = require("../dto/CreateEventHistoryDto");
const { getProductData, getEventHistoryData } = require("../repository/productRepository");

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
    const productData = await getProductData(user.idx, productIdx);
    if (!productData) {
        throw new NotFoundException("Cannot find product");
    }
    console.log(productData);
    const productDto = new CreateProductDto(productData);
    const product = productDto.createProduct();

    const eventHistoryData = await getEventHistoryData(productIdx);
    if (!eventHistoryData) {
        throw new NotFoundException("Cannot find product's eventHistory ");
    }

    const eventHistoryDto = new CreateEventHistoryDto(eventHistoryData);
    const eventHistory = eventHistoryDto.createEventHistory();

    return {
        product,
        eventHistory,
    };
};

module.exports = { getProductByIdx };
