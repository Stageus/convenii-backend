module.exports = class GetCachedMainProductDto {
    account;
    companyIdx;
    option;
    constructor(data) {
        this.account = data.account;
        this.companyIdx = data.companyIdx;
        this.option = data.option;
    }

    static createDto(user, param, query) {
        return new GetCachedMainProductDto({
            account: user,
            companyIdx: param.companyIdx,
            option: query.option === "main" ? "main" : query.page,
        });
    }
};
