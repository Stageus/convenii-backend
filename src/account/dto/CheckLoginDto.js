class CheckLoginDto {
    /**
     * @type {number}
     */
    needRank;

    /**
     * @type {string|null}
     */
    token;

    /**
     *
     * @param {
     *  needRank: number,
     *  token: string | null
     * } data
     */
    constructor(data) {
        this.needRank = data.needRank;
        this.token = data.token;
    }

    /**
     *
     * @param {req.headers} headers
     * @param {number} needRank
     * @returns
     */
    static createDto(headers, needRank) {
        return new CheckLoginDto({
            needRank: needRank,
            token: headers.authorization,
        });
    }
}

module.exports = CheckLoginDto;
