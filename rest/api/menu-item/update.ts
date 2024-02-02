import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { Ingredient } from '../../entities/ingredient';
import { IsDefined, IsNumber, validate, ValidateNested } from 'class-validator';
import { plainToClass, Type } from 'class-transformer';
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

class UpdateMenuItemRequest {
    @IsDefined()
    @ValidateNested({ each: true })
    @Type(() => MenuItemIngredient)
    ingredients!: MenuItemIngredient[];
}


const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ds = await newDataSource();
    const repo = ds.getRepository(MenuItem);

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
    const parsedBody = plainToClass(UpdateMenuItemRequest, JSON.parse(event.body));

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

    const { affected } = await repo.update({ id }, { ingredients: parsedBody.ingredients });

    if (affected === 0) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'menu item not found' }),
        };
    }

    const menuItem = await repo.findOneBy({ id });

    return {
        statusCode: 200,
        body: JSON.stringify(menuItem),
    };
};

export const lambdaHandler = newHandler(handler);
