class CreateProductDto {
    constructor({ idx, name, categoryIdx, categoryName, createdAt, price, productImg, score, bookmarked }) {
        this.idx = idx;
        this.name = name;
        this.category = {
            idx: categoryIdx,
            name: categoryName,
        };
        this.createdAt = createdAt;
        this.price = price;
        this.productImg = productImg;
        this.score = score;
        this.bookmarkState = bookmarked;
    }

    static from(data) {
        return new CreateProductDto(data);
    }
}

module.exports = CreateProductDto;
