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
        let token = null;
        if (headers.authorization) {
            token = headers.authorization.split(" ")[1];
        }
        return new CheckLoginDto({
            needRank: needRank,
            token: token,
        });
    }
}

module.exports = CheckLoginDto;
