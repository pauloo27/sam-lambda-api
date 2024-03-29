import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getCorsHeaders } from './cors';

export function newHandler(handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            const result = await handler(event);
            result.headers = {
                ...getCorsHeaders(),
                ...result.headers,
            };
            return result;
        } catch (error) {
            console.error({ error });
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'something went wrong', error }),
            };
        }
    };
}
