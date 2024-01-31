import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../db/datasource';
import { Ingredient } from '../../entities/ingredient';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const ds = await newDataSource();
        const repo = ds.getRepository(Ingredient);
        const ingredients = await repo.find();

        return {
            statusCode: 200,
            body: JSON.stringify(ingredients),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'something went wrong', error }),
        };
    }
};
