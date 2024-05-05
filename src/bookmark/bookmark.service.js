const { selectEvents } = require("../event/event.repository");
const ProductEntity = require("../product/entity/ProductEntity");
const { selectProductsBookmarked } = require("../product/product.repository");
const { UnauthorizedException, NotFoundException, BadRequestException } = require("../util/module/Exception");
const { selectBookmarkWithAccount, insertBookmark, deleteBookmark, selectBookmarkedProductIdx } = require("./bookmark.repository");
const CreateBookmarkDto = require("./dto/CreateBookmarkDto");
const GetBookmarkedProductDto = require("./dto/GetBookmarkedProductDto");
const RemoveBookmarkDto = require("./dto/RemoveBookmarkDto");

/**
 *
 * @param {CreateBookmarkDto} createBookmarkDto
 * @returns {Promise<void>}
 */
const createBookmark = async (createBookmarkDto) => {
    try {
        const alreadyBookmarked = await selectBookmarkWithAccount(createBookmarkDto);
        if (alreadyBookmarked) {
            throw new UnauthorizedException("alreadyBookmarked");
        }
        await insertBookmark(createBookmarkDto);
    } catch (err) {
        if (err.code === "23503") {
            throw new BadRequestException("cannot found product");
        } else {
            throw err;
        }
    }
};

/**
 *
 * @param {RemoveBookmarkDto} removeBookmarkDto
 * @returns {Promise<void}
 */
const removeBookmark = async (removeBookmarkDto) => {
    await deleteBookmark(removeBookmarkDto);
};

/**
 *
 * @param {GetBookmarkedProductDto} getBookmarkedProductDto
 * @returns {Promise<ProductEntity[]>}
 */
const getBookmarkedProduct = async (getBookmarkedProductDto) => {
    const bookmarkedProductList = await selectBookmarkedProductIdx(getBookmarkedProductDto);
    if (bookmarkedProductList.length === 0) {
        throw new NotFoundException("no products");
    }

    const productList = await selectProductsBookmarked(getBookmarkedProductDto);
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
    createBookmark,
    removeBookmark,
    getBookmarkedProduct,
};
