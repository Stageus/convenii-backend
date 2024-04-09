const query = require("../modules/query");
const { getProductData } = require("../repository/productRepository");

const getProductByIdx = async (user, productIdx) => {
    const product = getProductData(user.idx, productIdx);
    if (!product) {
        throw new NotFoundException("Cannot find product");
    }

    //const product = Product.createProduct(proudctSelectResult.rows[0]);

    return {
        product,
        history: eventInfoSelectResult.rows,
    };
};
