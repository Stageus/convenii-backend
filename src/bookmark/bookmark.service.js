const { UnauthorizedException } = require("../util/module/Exception");
const { selectBookmarkWithAccount, insertBookmark } = require("./bookmark.repository");
const CreateBookmarkDto = require("./dto/CreateBookmarkDto");

/**
 *
 * @param {CreateBookmarkDto} createBookmarkDto
 * @returns {Promise<void>}
 */
const createBookmark = async (createBookmarkDto) => {
    const alreadyBookmarked = await selectBookmarkWithAccount(createBookmarkDto);
    if (alreadyBookmarked) {
        throw new UnauthorizedException("alreadyBookmarked");
    }
    await insertBookmark(createBookmarkDto);
};
