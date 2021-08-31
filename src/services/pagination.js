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

                const url = "http://foo.bar";
                const startIndex = (page - 1) * limit + 1;
                const endIndex = page * limit;
                const totalPages = Math.ceil(total / limit) || 1;

                let prevPage = null;
                let nextPage = null;
                const links = {
                    first: `${url}?page=1`,
                    last: `${url}?page=${totalPages}`,
                    prev: null,
                    next: null,
                };

                if (page > 1) {
                    prevPage = page - 1;
                    links.prev = `${url}?page=${prevPage}`;
                }

                if (endIndex < total) {
                    nextPage = page + 1;
                    links.next = `${url}?page=${nextPage}`;
                }

                resolve({
                    data,
                    pagination: {
                        total,
                        per_page: limit,
                        current_page: page,
                        prev_page: prevPage,
                        next_page: nextPage,
                        total_pages: totalPages,
                        from: startIndex,
                        to: endIndex,
                        links,
                    }
                });
            });
        });
    });
};
