const Event = require("./Event");

class ProductsWithEvents {
    /**
     *
     * @type {Array<
     *  idx:number,
     *  category_idx: number,
     *  price: string,
     *  score: string,
     *  month: string,
     *  events: Event,
     * >
     * }
     */
    productsWithEvents;

    /**
     *
     * @param {Array<
     *  idx:number,
     *  category_idx: number,
     *  price: string,
     *  score: string,
     *  month: string,
     *  events: Event,
     * >
     * } data
     */
    constructor(data) {
        this.productsWithEvents = data.map((item) => ({
            idx: item.idx,
            category_idx: item.category_idx,
            price: item.price,
            score: item.score,
            bookmarked: item.bookmarked,
            month: item.month,
            events: item.events.map((event) => ({
                companyIdx: event.companyIdx,
                eventIdx: event.eventIdx,
                price: event.price,
            })),
        }));
    }
}

module.exports = ProductsWithEvents;
