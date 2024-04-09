const CreateProductDto = require("../dto/CreateProductDto");

const { getProductData } = require("../repository/productRepository");

const getProductByIdx = async (user, productIdx) => {
    const productData = await getProductData(user.idx, productIdx);
    if (!productData) {
        throw new NotFoundException("Cannot find product");
    }

    const product = CreateProductDto.createProduct(productData);

    return {
        product,
        history: eventInfoSelectResult.rows,
    };
};
