const CreateEventHistoryDto = require("../dto/CreateEventHistoryDto");
const CreateProductDto = require("../dto/CreateProductDto");

/**
 *
 * @param {Promise<Array<{
 *      idx: number,
 *      categoryIdx: number,
 *      name: string,
 *      price: string,
 *      imageUrl: string,
 *      score: string,
 *      createdAt: Date,
 *      bookmarked: boolean,
 *      month: Date,
 *      events: Array<{
 *          companyIdx: number,
 *          eventIdx: number,
 *          price: string | null
 *      }| null>
 *   }>
 * } productsData
 * @returns {Promise<Array<{
 *          product:Product
 *          events:EventHistory
 *      }
 * >}
 */
const productEventWrapper = async (productsData) => {
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

module.exports = productEventWrapper;
