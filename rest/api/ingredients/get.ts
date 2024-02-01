import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { Ingredient } from '../../entities/ingredient';
import { newHandler } from '../../core/api/handler';

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ds = await newDataSource();
    const repo = ds.getRepository(Ingredient);

    const id = event.pathParameters?.id ? parseInt(event.pathParameters.id) : undefined;

    if (id === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'missing id' }),
        };
    }

    const ingredient = await repo.findOneBy({ id });
    if (!ingredient) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'ingredient not found' }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(ingredient),
    };
};

export const lambdaHandler = newHandler(handler);
