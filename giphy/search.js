require('request');
const request = require('request-promise');
const { errors } = require('../status-codes/codes');

let apiEndpoints = {
    'search_gifs_url': 'http://api.giphy.com/v1/gifs/search'
};

function searchOneGIF(query) {
    let encodedQuery = encodeURIComponent(query).replace(/%20/g, "+");
    let endpoint = `${apiEndpoints['search_gifs_url']}?api_key=${process.env.GIPHY_API_KEY}&q=${encodedQuery}&limit=1`;
    return request({
        method: 'GET',
        url: endpoint
    });
}

async function generateGIFURL(query) {
    try {
        let response = await searchOneGIF(query);

        // Parse the data as the request returns a stringified JSON object
        let { data }  = JSON.parse(response);
        return data[0].images.original.url;
    }
    catch (err) {
        console.log(err);
        throw errors.InternalServerError();
    }
}

module.exports = {
    generateGIFURL
}

