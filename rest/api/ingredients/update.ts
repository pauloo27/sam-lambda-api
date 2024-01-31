import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../db/datasource';
import { Ingredient } from '../../entities/ingredient';
import { IsDefined, IsNumber, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

class UpdateIngredientRequest {
    @IsNumber()
    @IsDefined()
    availableAmount = 0;
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const ds = await newDataSource();
        const repo = ds.getRepository(Ingredient);

        if (!event.body)
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'missing request body' }),
            };

        const id = event.pathParameters?.id ? parseInt(event.pathParameters.id) : undefined;

        if (id === undefined) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'missing id' }),
            };
        }
        const parsedBody = plainToClass(UpdateIngredientRequest, JSON.parse(event.body));

        const validationErrors = await validate(parsedBody);

        if (validationErrors.length > 0) {
            return {
                statusCode: 422,
                body: JSON.stringify({
                    message: 'invalid request body',
                    errors: validationErrors,
                }),
            };
        }

        const { affected } = await repo.update({ id }, { availableAmount: parsedBody.availableAmount });

        if (affected === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'ingredient not found' }),
            };
        }

        const ingredient = await repo.findOneBy({ id });

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
