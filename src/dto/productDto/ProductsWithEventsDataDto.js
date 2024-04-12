const Event = require("../../entity/Event");

class ProductsWithEventsDataDto {
    /**
     *
     * @type {Array<
     *  idx:number,
     *  categoryIdx: number,
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
     *  categoryIdx: number,
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
            categoryIdx: item.category_idx,
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

module.exports = ProductsWithEventsDataDto;
