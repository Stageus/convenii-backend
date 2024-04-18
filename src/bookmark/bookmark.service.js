const { UnauthorizedException } = require("../util/module/Exception");
const { selectBookmarkWithAccount, insertBookmark, deleteBookmark } = require("./bookmark.repository");
const CreateBookmarkDto = require("./dto/CreateBookmarkDto");
const RemoveBookmarkDto = require("./dto/RemoveBookmarkDto");

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

/**
 *
 * @param {RemoveBookmarkDto} removeBookmarkDto
 * @returns {Promise<void}
 */
const removeBookmark = async (removeBookmarkDto) => {
    await deleteBookmark(removeBookmarkDto);
};

module.exports = {
    createBookmark,
    removeBookmark,
};
