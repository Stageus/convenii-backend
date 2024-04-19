const AccountEntity = require("../../entity/AccountEntity");

class GetAccountResponseDto {
    /**
     * @type {AccountEntity}
     */
    data;

    /**
     * @type {LoginStatus}
     */
    authStatus;

    /**
     *
     * @param {
     *  data: AccountEntity,
     *  authStatus: LoginStatus,
     * } param
     */
    constructor(param) {
        this.data = param.data;
        this.authStatus = param.authStatus;
    }

    /**
     *
     * @param {AccountEntity} user
     * @returns {GetAccountResponseDto}
     */
    static create(user) {
        return new GetAccountResponseDto({
            data: {
                idx: user.idx,
                email: user.email,
                nickname: user.nickname,
                createdAt: user.createdAt,
            },
            authStatus: user.authStatus,
        });
    }
}

module.exports = GetAccountResponseDto;
