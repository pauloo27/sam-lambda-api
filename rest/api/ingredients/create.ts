import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../db/datasource';
import { Ingredient } from '../../entities/ingredient';
import { IsDefined, IsNumber, IsString, Length, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { isUniqueErr } from '../../db/err';

class CreateIngredientRequest {
    @IsString()
    @Length(1, 255)
    @IsDefined()
    name!: string;

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
        const parsedBody = plainToClass(CreateIngredientRequest, JSON.parse(event.body));

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

        const entity = await repo.save(repo.create(parsedBody));
        return {
            statusCode: 201,
            body: JSON.stringify(entity),
        };
    } catch (error) {
        if (isUniqueErr(error)) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: 'ingredient already exists' }),
            };
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'something went wrong', error }),
        };
    }
};
