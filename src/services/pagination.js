/**
 * Get the options for paging the results of a query of a model
 * @param   int    limit [Defauls to '0']
 * @param   int    page  [Defauls to '1']
 * @returns object
 */
exports.getOptions = (limit = 0, page = 1) => ({ limit, skip: (page - 1) * limit });
