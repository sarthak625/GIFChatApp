
/**
 * Initialize libraries
 */

require('request');
const request = require('request-promise');
const cheerio = require('cheerio');
const util = require('util');

const { errors } = require('../status-codes/codes');
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


/**
 * Add the replace all function to string type
 */

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


// Load the URL using cheerio
function loadThePage(url) {
    const options = {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return request(options);
}

/**
 * Scrape the web page using cheerio to get download links
 */
async function getPagalWorldDownloadLink(song) {
    try {
        // If the data is cached
        let cachedData = await redisClient.get('pagalworld=> ' + song);

        if (cachedData){
            return JSON.parse(cachedData);
        }
        else{
            console.log('Not cached');
            let url = `https://www.pagalworld.live/search?cats=&q=${encodeURIComponent(song)}`;
            
            // Get the search results
            let page = await loadThePage(url);
            let redirects = page('main #w0 div.cat-list a');
            
            // Fetch the redirect links from the search results
            let redirectLinks = [];
            redirects.each(function (i, elem) {
                let link = page(this).attr('href');
                redirectLinks.push(link);
            })
            
            // If no results were found, throw an error, else download the topmost result
            if (redirectLinks.length === 0) throw errors.NotFound(`No results found for ${song}`);
            else {
                let downloadLink = `https://www.pagalworld.live/${redirectLinks[0]}`;
                await redisClient.set('pagalworld=> ' + song, JSON.stringify({ downloadLink }));

                return {
                    downloadLink
                }
            }
        }
        }
        catch (err) {
            console.log(err);
            throw err;
        }
}

async function getDownloadLinkForSongs(songs){
    let operations = [];
    
    songs.forEach(song => {
        operations.push(getPagalWorldDownloadLink(song).catch(err => err));
    });

    return Promise.all(operations);
}


module.exports = {
    generateGIFURL,
    generateGIFURLBulk,
    getDownloadLinkForSongs
}

