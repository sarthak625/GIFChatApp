let errors = {
    InternalServerError: (message) => {
        return {
            code: 500,
            message: message || 'Internal Server Error'
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