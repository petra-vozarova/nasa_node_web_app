//if limit not set all items will be returned automatically
const DEFAULT_PAGE_LIMIT = 0;
const DEFAUL_PAGE_NUMBER = 1;

function getPagination(query){
    const page = Math.abs(query.page) || DEFAUL_PAGE_NUMBER;
    const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
    //if 1st page, nothing skipped, if 2nd page, 1st page skipped
    const skip = (page - 1) * limit;

    return({
        skip,
        limit,
    })

}

module.exports = {
    getPagination,
}