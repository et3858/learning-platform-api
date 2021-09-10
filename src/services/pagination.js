/**
 * Returns a link to the endpoint of a url with a page query
 * @param  {int}    page [Defaults to '1']
 * @return {string}
 */
const createUrl = (page = 1) => `http://foo.bar?page=${page}`;


/**
 * Returns the results of the pagination
 * @param  {int}    limit
 * @param  {int}    page
 * @param  {int}    total
 * @return {object}
 */
function getResults(limit, page, total) {
    const startIndex = (page - 1) * limit + 1;
    const endIndex = page * limit;
    const totalPages = Math.ceil(total / limit) || 1;
    const prevPage = (page > 1) ? page - 1 : null;
    const nextPage = (endIndex < total) ? page + 1 : null;

    // Add page query to the links of the endpoint
    const first = createUrl();
    const last = createUrl(totalPages);
    const prev = !prevPage ? null : createUrl(prevPage);
    const next = !nextPage ? null : createUrl(nextPage);

    return {
        total,
        per_page: limit,
        current_page: page,
        prev_page: prevPage,
        next_page: nextPage,
        total_pages: totalPages,
        from: startIndex,
        to: endIndex,
        links: { first, last, prev, next },
    };
}


/**
 * Get the options for paging the results of a query of a model
 * @param  {int}    limit [Defauls to '0']
 * @param  {int}    page  [Defauls to '1']
 * @return {object}
 */
exports.getOptions = (limit = 0, page = 1) => ({ limit, skip: (page - 1) * limit });


/**
 * Paginate the results
 * @param  {object} modelQuery [Must be a instance of mongoose.Query]
 * @return {object}            [{ data, paginate }]
 */
exports.responder = (modelQuery) => {
    return new Promise((resolve, reject) => {
        modelQuery.exec((err, data) => {
            if (err) return reject(err);

            const limit = modelQuery.options["limit"] || 0;
            const page = ((modelQuery.options["skip"] || 0) / limit) + 1;

            if (limit === 0) return resolve({ data });

            modelQuery.model.count(modelQuery._conditions, (err, total) => {
                if (err) return reject(err);

                const pagination = getResults(limit, page, total);
                resolve({ data, pagination });
            });
        });
    });
};
