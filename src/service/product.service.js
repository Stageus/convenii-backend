const CreateProductDto = require("../dto/CreateProductDto");

const { getProductData, getEventHistoryData } = require("../repository/productRepository");

const getProductByIdx = async (user, productIdx) => {
    const productData = await getProductData(user.idx, productIdx);
    if (!productData) {
        throw new NotFoundException("Cannot find product");
    }
    const productDto = new CreateProductDto(productData);
    const product = productDto.createProduct();

    const eventHistoryData = await getEventHistoryData(productIdx);
    if (!eventHistoryData) {
        throw new NotFoundException("Cannot find product's eventHistory ");
    }

    return {
        product,
        history: eventInfoSelectResult.rows,
    };
};
