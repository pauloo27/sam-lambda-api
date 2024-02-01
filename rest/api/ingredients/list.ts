import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { Ingredient } from '../../entities/ingredient';
import { newHandler } from '../../core/api/handler';

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ds = await newDataSource();
    const repo = ds.getRepository(Ingredient);
    const ingredients = await repo.find({ order: { id: 'ASC' } });

    return {
        statusCode: 200,
        body: JSON.stringify(ingredients),
    };
};

export const lambdaHandler = newHandler(handler);
