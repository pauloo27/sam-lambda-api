import 'reflect-metadata';
import Decimal from 'decimal.js';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { IsDefined, IsNumber, IsString, Length, validate, ValidateNested } from 'class-validator';
import { plainToClass, Type } from 'class-transformer';
import { newHandler } from '../../core/api/handler';
import { Order, OrderStatus } from '../../entities/order';
import { In } from 'typeorm';
import { MenuItem } from '../../entities/menu-item';
import { Ingredient } from '../../entities/ingredient';

class OrderMenuItem {
    @IsNumber()
    @IsDefined()
    menuItemId!: number;

    @IsNumber()
    @IsDefined()
    amount!: number;
}

class PlaceOrderRequest {
    @IsString()
    @Length(1, 255)
    @IsDefined()
    customerName!: string;

    @ValidateNested({ each: true })
    @Type(() => OrderMenuItem)
    orderItems!: OrderMenuItem[];
}

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ds = await newDataSource();
    const repo = ds.getRepository(Order);
    if (!event.body)
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'missing request body' }),
        };
    const ingredientRepo = ds.getRepository(Ingredient);

    const parsedBody = plainToClass(PlaceOrderRequest, JSON.parse(event.body));

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

    // TODO: tx with lock lock lock
    const menuItemIds = parsedBody.orderItems.map((item) => item.menuItemId);
    const menuItems = await ds
        .getRepository(MenuItem)
        .find({ where: { id: In(menuItemIds) }, relations: ['ingredients', 'ingredients.ingredient'] });

    let totalPrice = new Decimal(0);
    const missingIngredients: string[] = [];

    for (const item of parsedBody.orderItems) {
        const menuItem = menuItems.find((m) => m.id == item.menuItemId);
        if (!menuItem) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'invalid menu item' }),
            };
        }

        for (const ingredient of menuItem.ingredients) {
            const requiredIngredients = item.amount * ingredient.amount;
            const availableIngredients = ingredient.ingredient.availableAmount;
            if (availableIngredients < requiredIngredients) {
                missingIngredients.push(ingredient.ingredient.name);
            }
            ingredient.ingredient.availableAmount -= requiredIngredients;
        }

        const itemPrice = new Decimal(menuItem.price);
        totalPrice = totalPrice.add(itemPrice.mul(item.amount));
    }

    if (missingIngredients.length > 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'not enough ingredients',
                missingIngredients: missingIngredients,
            }),
        };
    }

    await ingredientRepo.save(menuItems.flatMap((m) => m.ingredients.map((i) => i.ingredient)));
    const entity = await repo.save(
        repo.create({ ...parsedBody, status: OrderStatus.PENDING, price: totalPrice.toString() }),
    );
    return {
        statusCode: 201,
        body: JSON.stringify(entity),
    };
};

export const lambdaHandler = newHandler(handler);
