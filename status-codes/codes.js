let errors = {
    InternalServerError: (message) => {
        return {
            code: 500,
            message: message || 'Internal Server Error'
        }
    },
    RateLimiting : (message) => {
        return {
            code: 429,
            message: message || 'You can only create upto a maximum of 10 rooms.'
        }
    }
}

let success = {
    Success: (message) => {
        return {
            code: 200,
            message: message || 'Success'
        }
    }
}

module.exports = {
    errors,
    success
}