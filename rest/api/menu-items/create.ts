import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { IsDefined, IsNumber, IsNumberString, IsString, Length, validate, ValidateNested } from 'class-validator';
import { plainToClass, Type } from 'class-transformer';
import { isUniqueErr } from '../../core/db/err';
import { newHandler } from '../../core/api/handler';
import { MenuItem } from '../../entities/menu-item';

class MenuItemIngredient {
    @IsNumber()
    @IsDefined()
    ingredientId!: number;

    @IsNumber()
    @IsDefined()
    amount!: number;
}

class CreateMenuItemRequest {
    @IsString()
    @Length(1, 255)
    @IsDefined()
    name!: string;

    @IsString()
    @IsDefined()
    @IsNumberString()
    price!: string;

    @IsDefined()
    @ValidateNested({ each: true })
    @Type(() => MenuItemIngredient)
    ingredients!: MenuItemIngredient[];
}

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const ds = await newDataSource();
        const repo = ds.getRepository(MenuItem);
        if (!event.body)
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'missing request body' }),
            };
        const parsedBody = plainToClass(CreateMenuItemRequest, JSON.parse(event.body));

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
                body: JSON.stringify({ message: 'menu item already exists' }),
            };
        }
        throw error;
    }
};

export const lambdaHandler = newHandler(handler);
