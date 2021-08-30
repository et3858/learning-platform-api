/**
 * Get the options for paging the results of a query of a model
 * @param   int    limit [Defauls to '0']
 * @param   int    page  [Defauls to '1']
 * @returns object
 */
exports.getOptions = (limit = 0, page = 1) => ({ limit, skip: (page - 1) * limit });



/**
 * Paginate the results
 * @param   object modelQuery [Must be a instance of mongoose.Query]
 * @returns object            [{ data, paginate }]
 */
exports.responder = (modelQuery) => {
    return new Promise((resolve, reject) => {

        modelQuery.exec((err, data) => {
            if (err) return reject(err);

            let limit = modelQuery.options["limit"] || 0;
            let page = ((modelQuery.options["skip"] || 0) / limit) + 1;

            if (limit === 0) return resolve({ data });

            modelQuery.model.count(modelQuery._conditions, (err, total) => {
                if (err) return reject(err);

                const url = "http://foo.bar";
                const startIndex = (page - 1) * limit + 1;
                const endIndex = page * limit;
                const total_pages = Math.ceil(total / limit) || 1;

                let prev_page = null;
                let next_page = null;
                let links = {
                    first: `${url}?page=1`,
                    last: `${url}?page=${total_pages}`,
                    prev: null,
                    next: null,
                };

                if (page > 1) {
                    prev_page = page - 1;
                    links.prev = `${url}?page=${prev_page}`
                }

                if (endIndex < total) {
                    next_page = page + 1;
                    links.next = `${url}?page=${next_page}`
                }

                resolve({
                    data,
                    pagination: {
                        total,
                        per_page: limit,
                        current_page: page,
                        prev_page,
                        next_page,
                        total_pages,
                        from: startIndex,
                        to: endIndex,
                        links,
                    }
                });
            });
        });
    });
};
