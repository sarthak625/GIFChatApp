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
            message: message || 'Limit Reached'
        }
    },
    Conflict : (message) => {
        return {
            code: 409,
            message: message || 'Conflict'
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