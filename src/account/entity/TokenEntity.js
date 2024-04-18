const issueToken = require("../../util/module/issueToken");
const Account = require("../model/account.model");

class TokenEntity {
    /**
     * @type {string}
     */
    accessToken;

    /**
     *
     * @param {
     *  accessToken: string
     * } data
     */
    constructor(data) {
        this.accessToken = data.accessToken;
    }

    /**
     *
     * @param {Account} account
     * @returns {TokenEntity}
     */
    static createEntity(account) {
        const tokenPayload = {
            idx: account.idx,
            email: account.email,
            nickname: account.nickname,
            rankIdx: account.rankIdx,
            createdAt: account.createdAt,
        };

        const tokenOptions = {
            issuer: account.nickname,
            expiresIn: "300m",
        };
        return new TokenEntity({
            accessToken: issueToken(tokenPayload, tokenOptions),
        });
    }
}

module.exports = TokenEntity;
