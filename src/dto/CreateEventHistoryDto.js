const EventHistory = require("../entity/EventHistory");
const { BadRequestException } = require("../modules/Exception");
const CreateEventDto = require("./CreateEventDto");

class CreateEventHistoryDto {
    /**
     * @type {Date}
     */
    month;

    /**
     * @type {
     *      Array<{
     *          companyIdx: number,
     *          eventIdx: number,
     *          price: string | null
     *      }>
     * }
     */
    events;

    /**
     * @param {{
     *  month: string,
     *  events: Array<{
     *      companyIdx: number,
     *      eventIdx: number,
     *      price: string | null
     *  }>
     * }} data
     */
    constructor(data) {
        this.month = data.month;
        this.events = data.events.map(
            (eventData) =>
                new Event({
                    companyIdx: eventData.companyIdx,
                    eventIdx: eventData.eventIdx,
                    price: eventData.price,
                })
        );
    }

    validate() {
        if (!this.companyIdx || typeof this.companyIdx !== "number") {
            throw new BadRequestException("companyIdx error");
        }
        if (!this.productIdx || typeof this.productIdx !== "number") {
            throw new BadRequestException("productIdx error");
        }
        if (!this.eventIdx || typeof this.eventIdx !== "number") {
            throw new BadRequestException("eventType error");
        }
        if (this.price !== null && typeof this.price !== "string") {
            throw new BadRequestException("price error");
        }
        if (!(this.month instanceof Date) || isNaN(this.month.getTime())) {
            throw new BadRequestException("month error");
        }
        for (let i = 0; i < this.events.length; i++) {
            const eventDto = new CreateEventDto(events[i]);
            if (!eventDto.validate()) {
                throw new BadRequestException("events error");
            }
        }
    }
    /**
     *
     * @returns {EventHistory}
     * @throws {BadRequestException}
     */
    createEventHistory() {
        this.validate();
        return new EventHistory({
            month: this.month,
            events: this.events,
        });
    }
}

module.exports = CreateEventHistoryDto;
