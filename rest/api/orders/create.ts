import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { IsDefined, IsNumber, IsString, Length, validate, ValidateNested } from 'class-validator';
import { plainToClass, Type } from 'class-transformer';
import { newHandler } from '../../core/api/handler';
import { Order, OrderStatus } from '../../entities/order';

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

    const entity = await repo.save(repo.create({ ...parsedBody, status: OrderStatus.PENDING }));
    return {
        statusCode: 201,
        body: JSON.stringify(entity),
    };
};

export const lambdaHandler = newHandler(handler);
