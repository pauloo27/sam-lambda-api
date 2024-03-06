import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { IsDefined, IsNumber, IsPositive, IsString, Length, validate, ValidateNested } from 'class-validator';
import { plainToClass, Type } from 'class-transformer';
import { newHandler } from '../../core/api/handler';
import { Order, OrderStatus } from '../../entities/order';
import { MenuItem } from '../../entities/menu-item';
import Decimal from 'decimal.js';
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
    if (!event.body)
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'missing request body' }),
        };

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

    try {
        return await ds.manager.transaction(async (manager) => {
            const orderRepo = manager.getRepository(Order);
            const menuItemRepo = manager.getRepository(MenuItem);
            const ingredientRepo = manager.getRepository(Ingredient);

            let totalPrice = new Decimal(0);

            for (const orderItem of parsedBody.orderItems) {
                const menuItem = await menuItemRepo.findOne({
                    where: { id: orderItem.menuItemId },
                    relations: ['ingredients', 'ingredients.ingredient'],
                });

                if (!menuItem) {
                    throw {
                        statusCode: 400,
                        body: JSON.stringify({ message: 'invalid menu item' }),
                    };
                }

                for (const itemIngredient of menuItem.ingredients) {
                    const requiredIngredients = itemIngredient.amount * orderItem.amount;

                    if (requiredIngredients > itemIngredient.ingredient.availableAmount) {
                        throw {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: `not enough ingredient ${itemIngredient.ingredient.name}`,
                            }),
                        };
                    }

                    await ingredientRepo.save({
                        ...itemIngredient.ingredient,
                        availableAmount: itemIngredient.ingredient.availableAmount - requiredIngredients,
                    });
                }

                const itemPrice = new Decimal(orderItem.amount).mul(new Decimal(menuItem.price));
                totalPrice = totalPrice.add(itemPrice);
            }

            const entity = await orderRepo.save(
                orderRepo.create({ ...parsedBody, status: OrderStatus.PENDING, price: totalPrice.toString() }),
            );

            return {
                statusCode: 201,
                body: JSON.stringify(entity),
            };
        });
    } catch (e: any) {
        if ('statusCode' in e && 'body' in e) {
            return e;
        }
        throw e;
    }
};

export const lambdaHandler = newHandler(handler);
