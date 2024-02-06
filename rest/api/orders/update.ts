import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { newDataSource } from '../../core/db/datasource';
import { IsEnum, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { newHandler } from '../../core/api/handler';
import { Order, OrderStatus } from '../../entities/order';

class UpdateOrderRequest {
    @IsEnum(OrderStatus)
    status!: OrderStatus;
}

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ds = await newDataSource();
    const repo = ds.getRepository(Order);

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
    const parsedBody = plainToClass(UpdateOrderRequest, JSON.parse(event.body));

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

    const { affected } = await repo.update({ id }, { status: parsedBody.status });

    if (affected === 0) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'order not found' }),
        };
    }

    const order = await repo.findOneBy({ id });

    return {
        statusCode: 200,
        body: JSON.stringify(order),
    };
};

export const lambdaHandler = newHandler(handler);
