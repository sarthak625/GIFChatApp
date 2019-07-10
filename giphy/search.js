require('request');
const request = require('request-promise');
const { errors } = require('../status-codes/codes');
const util = require('util');

require('dotenv').config();

// Set up redis for caching
const redis = require('redis');
let redisClient = redis.createClient({
    port : process.env.REDIS_PORT,
    host : process.env.REDIS_IP
});

redisClient.on('connect', ()=> console.log('Connected to redis successfully'));
redisClient.on('error', err => console.log(err));
redisClient.get = util.promisify(redisClient.get);
redisClient.set = util.promisify(redisClient.set);

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
        // If the data is cached
        let cachedData = await redisClient.get(query);
        
        if (cachedData){
            return cachedData;
        }
        else{
            let response = await searchOneGIF(query);
            // Parse the data as the request returns a stringified JSON object
            let { data }  = JSON.parse(response);
            await redisClient.set(query, data[0].images.original.url);
            return data[0].images.original.url;
        }
    }
    catch (err) {
        console.log(err);
        throw errors.InternalServerError();
    }
}

async function generateGIFURLBulk(queries){
    let operations = [];
    
    queries.forEach(query => {
        operations.push(generateGIFURL(query));
    });

    return Promise.all(operations);
}

module.exports = {
    generateGIFURL,
    generateGIFURLBulk
}

