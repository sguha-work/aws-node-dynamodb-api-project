const CommonHandlers = {
    notFound: async (c, event, context) => ({
        statusCode: 404,
        body: JSON.stringify({ err: 'Path not found', c: 'c' }),
        headers,
    }),
    notImplemented: async (c, event, context) => ({
        statusCode: 400,
        body: JSON.stringify({ err: 'No handler registered for operation' }),
        headers,
    }),
    unauthorizedHandler: async (c, event, context) => ({
        statusCode: 401,
        body: JSON.stringify({ err: 'Please authenticate first' }),
        headers,
    }),
    validationFail: async (c, event, context) => ({
        statusCode: 400,
        body: JSON.stringify({ err: c.validation.errors }),
        headers,
    })
}
export default CommonHandlers;