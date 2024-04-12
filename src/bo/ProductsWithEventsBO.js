const Event = require("../entity/Event");

class ProductsWithEventsBO {
    /**
     *
     * @type {Array<
     *  idx:number,
     *  name: string,
     *  categoryIdx: number,
     *  price: string,
     *  score: string,
     *  month: string,
     *  events: Event | null,
     * >
     * }
     */
    productsWithEvents;

    /**
     *
     * @param {Array<
     *  idx:number,
     *  name: string,
     *  categoryIdx: number,
     *  price: string,
     *  score: string,
     *  month: string,
     *  events: Event||null,
     * >
     * } data
     */
    constructor(data) {
        this.productsWithEvents = data.productsWithEvents.map((item) => ({
            idx: item.idx,
            name: item.name,
            categoryIdx: item.category_idx,
            price: item.price,
            score: item.score,
            bookmarked: item.bookmarked,
            month: item.month,
            events:
                item.events?.map((event) => ({
                    companyIdx: event.companyIdx,
                    eventIdx: event.eventIdx,
                    price: event.price,
                })) || null,
        }));
    }
}

module.exports = ProductsWithEventsBO;
