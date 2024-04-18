const TokenEntity = require("../../entity/TokenEntity");

class SignInResponseDto {
    /**
     * @type {string}
     */
    accessToken;

    /**
     *
     * @param {{
     * accessToken:string
     * }} data
     */
    constructor(data) {
        this.accessToken = data.accessToken;
    }

    /**
     *
     * @param {TokenEntity} tokenEntity
     * @returns {{
     *  accessToken: string
     * }}
     */
    static createDto(tokenEntity) {
        return {
            accessToken: tokenEntity.accessToken,
        };
    }
}
module.exports = SignInResponseDto;
