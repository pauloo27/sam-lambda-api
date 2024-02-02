import { DataSource } from 'typeorm';
import { Ingredient } from '../../entities/ingredient';
import { MenuItem } from '../../entities/menu-item';
import { MenuItemIngredient } from '../../entities/menu-item-ingredient';
import { Order } from '../../entities/order';
import { OrderMenuItem } from '../../entities/order-menu-item';

let cachedDs: DataSource | null = null;

export async function newDataSource(): Promise<DataSource> {
    if (cachedDs) return cachedDs;

    const ds = new DataSource({
        type: 'postgres',
        host: process.env.PG_HOST,
        port: parseInt(process.env.PG_PORT || '5432'),
        username: process.env.PG_USER,
        password: process.env.PG_PASS,
        database: process.env.PG_DB,
        entities: [Ingredient, MenuItem, MenuItemIngredient, Order, OrderMenuItem],
    });
    await ds.initialize().catch((err) => console.error(err));

    if (process.env.PG_MIGRATE === 'true') {
        console.log(JSON.stringify({ msg: 'Migrating...' }));
        await ds.synchronize();
    }

    cachedDs = ds;
    return ds;
}
