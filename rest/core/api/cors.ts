export function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN ?? '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    };
}
