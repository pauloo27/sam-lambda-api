import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { newHandler } from '../../core/api/handler';
import { Order, OrderStatus } from '../../entities/order';

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ds = await newDataSource();
    const repo = ds.getRepository(Order);
    const statusFilter = event.queryStringParameters?.status as OrderStatus;
    const orders = await repo.find({ order: { id: 'ASC'}, where: { status: statusFilter }});

    return {
        statusCode: 200,
        body: JSON.stringify(orders),
    };
};

export const lambdaHandler = newHandler(handler);
