const { BadRequestException } = require("../modules/Exception");
const { Event } = require("../entity/Event");

class CreateEventDto {
    /**
     * @type {number}
     */
    companyIdx;
    /**
     * @type {number}
     */
    eventIdx;
    /**
     * @type { string | null}
     */
    price;
    /**
     * @param {{
     *  companyIdx: number;
     *  eventIdx: number;
     *  price: string | null;
     * }} datass
     */
    constructor(data) {
        this.companyIdx = data.companyIdx;
        this.eventIdx = data.eventIdx;
        this.price = data.price;
    }
    validate() {
        if (this.companyIdx !== null && (typeof this.companyIdx !== "number" || this.companyIdx <= 0)) {
            throw new BadRequestException("companyIdx error");
        }
        if (this.eventIdx !== null && (typeof this.eventIdx !== "number" || this.eventIdx <= 0)) {
            throw new BadRequestException("eventType error");
        }
        if (this.price !== null && typeof this.price !== "string") {
            throw new BadRequestException("price error");
        }
    }

    /**
     * @returns {Event}
     * @throws {BadRequestException}
     */
    createEvent() {
        this.validate();
        return new Event({
            companyIdx: this.companyIdx,
            eventIdx: this.eventIdx,
            price: this.price,
        });
    }
}

module.exports = CreateEventDto;
