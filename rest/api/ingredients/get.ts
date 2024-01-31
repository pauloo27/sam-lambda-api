import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../db/datasource';
import { Ingredient } from '../../entities/ingredient';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
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
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'something went wrong', error }),
        };
    }
};
