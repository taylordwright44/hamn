const advancedResults = (model, populate) => async (req, res, next) => {
    try {
        let query;
        // Copy req.query
        const reqQuery = { ...req.query };

        // Remove fields
        const removeFields = ['select', 'sort', 'page', 'limit', 'postSearch', 'lat', 'lon', 'dist'];

        // Loop over removeFields and delete them from req.query
        for (const param of removeFields) {
            delete reqQuery[param];
        }

        // Create query object
        let queryObj = { ...reqQuery };

        // Filter query object to add $regex for postSearch if present
        if (req.query.postSearch) {
            const searchValue = req.query.postSearch;
            queryObj = {
                $or: [
                    { head: { $regex: searchValue, $options: 'i' } },
                    { body: { $regex: searchValue, $options: 'i' } },
                ],
                ...queryObj, // Append existing query parameters
            };
        }

        // Add radius search if lat, lon, and dist parameters are present, I'm commenting this out for this app since I probably won't use lat/lon
        // if (req.query.lat && req.query.lon && req.query.dist) {
        //     const lat = parseFloat(req.query.lat);
        //     const lon = parseFloat(req.query.lon);
        //     const dist = parseFloat(req.query.dist);

        //     // Calculate radius using radians
        //     const radius = dist / 3963; // Earth Radius = 3,963 mi / 6,378 km

        //     // Add $geoWithin query for radius search
        //     queryObj.location = {
        //         $geoWithin: { $centerSphere: [[lon, lat], radius] }
        //     };
        // }

        // Find the model
        query = model.find(queryObj);

        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Set the sort order
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not specified
        const limit = parseInt(req.query.limit, 10) || 25; // Default to 25 results per page if not specified
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await model.countDocuments(queryObj);

        query = query.skip(startIndex).limit(limit);

        if (populate) {
            query = query.populate(populate);
        }

        // Execute query
        let results = await query;

        //let's get rid of reports.
        for (let i = 0; i < results.length; i++){
            results[i].reports = undefined;
        }

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit,
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit,
            };
        }

        res.advancedResults = {
            success: true,
            count: results.length,
            pagination,
            data: results,
        };

        //next();
    } catch (err) {
        // Check if the error is a cast error (e.g., invalid ObjectID)
        if (err.name === 'CastError') {
            return res.status(404).json({ success: false, error: 'Invalid ID format' });
        }
        // For other types of errors, pass them to the global error handler middleware
        next(err);
    }
};

module.exports = advancedResults;
