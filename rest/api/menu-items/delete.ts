import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { newHandler } from '../../core/api/handler';
import { MenuItem } from '../../entities/menu-item';

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ds = await newDataSource();
    const repo = ds.getRepository(MenuItem);

    const id = event.pathParameters?.id ? parseInt(event.pathParameters.id) : undefined;

    if (id === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'missing id' }),
        };
    }

    const { affected } = await repo.delete({ id });

    if (affected === 0) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'menu item not found' }),
        };
    }

    return {
        statusCode: 204,
        body: undefined as any,
    };
};

export const lambdaHandler = newHandler(handler);
