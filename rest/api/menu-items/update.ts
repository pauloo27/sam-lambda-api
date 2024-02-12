import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { IsDefined, IsNumber, IsNumberString, IsString, Length, validate, ValidateNested } from 'class-validator';
import { plainToClass, Type } from 'class-transformer';
import { newHandler } from '../../core/api/handler';
import { MenuItem } from '../../entities/menu-item';
import { MenuItemIngredient } from '../../entities/menu-item-ingredient';
import { In } from 'typeorm';

class MenuItemIngredientItem {
    @IsNumber()
    @IsDefined()
    ingredientId!: number;

    @IsNumber()
    @IsDefined()
    amount!: number;
}

class UpdateMenuItemRequest {
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
    @Type(() => MenuItemIngredientItem)
    ingredients!: MenuItemIngredientItem[];
}

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ds = await newDataSource();
    const repo = ds.getRepository(MenuItem);
    const menuItemIngredientRepo = ds.getRepository(MenuItemIngredient);

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

    // TODO: tx tx tx
    const menuItem = await repo.findOne({ where: { id }, relations: ['ingredients'] });
    if (!menuItem) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'menu item not found' }),
        };
    }

    await repo.update({ id }, { name: parsedBody.name, price: parsedBody.price });

    const toAdd = parsedBody.ingredients;
    const toRemove: MenuItemIngredient[] = [];
    const toUpdate: MenuItemIngredient[] = [];

    for (const ingredient of menuItem.ingredients) {
        const found = toAdd.find((i) => i.ingredientId == ingredient.ingredientId);
        if (!found) {
            toRemove.push(ingredient);
        } else {
            toUpdate.push({ ...ingredient, amount: found.amount });
            toAdd.splice(toAdd.indexOf(found), 1);
        }
    }

    await Promise.all([
        menuItemIngredientRepo.delete({
            menuItemId: menuItem.id,
            ingredientId: In(toRemove.map((i) => i.ingredientId)),
        }),
        ...toAdd.map((i) =>
            menuItemIngredientRepo.insert({ menuItemId: menuItem.id, ingredientId: i.ingredientId, amount: i.amount }),
        ),
        ...toUpdate.map((i) =>
            menuItemIngredientRepo.update(
                { menuItemId: menuItem.id, ingredientId: i.ingredientId },
                { amount: i.amount },
            ),
        ),
    ]);

    return {
        statusCode: 200,
        body: JSON.stringify(await repo.findOne({ where: { id }, relations: ['ingredients'] })),
    };
};

export const lambdaHandler = newHandler(handler);
