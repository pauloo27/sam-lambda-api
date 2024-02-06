import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { newHandler } from '../../core/api/handler';
import { Order } from '../../entities/order';

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ds = await newDataSource();
    const repo = ds.getRepository(Order);

    const id = event.pathParameters?.id ? parseInt(event.pathParameters.id) : undefined;

    if (id === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'missing id' }),
        };
    }

    const order = await repo.findOne({ where: { id }, relations: ['orderItems', 'orderItems.menuItem'] });
    if (!order) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'order not found' }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(order),
    };
};

export const lambdaHandler = newHandler(handler);
