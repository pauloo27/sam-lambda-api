import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { newHandler } from '../../core/api/handler';
import { MenuItem } from '../../entities/menu-item';

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ds = await newDataSource();
    const repo = ds.getRepository(MenuItem);
    const menuItems = await repo.find({ order: { id: 'ASC' }, relations: ['ingredients', 'ingredients.ingredient'] });

    return {
        statusCode: 200,
        body: JSON.stringify(menuItems),
    };
};

export const lambdaHandler = newHandler(handler);
