import { DataSource } from 'typeorm';
import { Ingredient } from '../entities/ingredient';

let cachedDs: DataSource | null = null;

export async function newDataSource(): Promise<DataSource> {
    // too bad
    if (cachedDs) return cachedDs;

    const ds = new DataSource({
        type: 'postgres',
        host: process.env.PG_HOST,
        port: parseInt(process.env.PG_PORT || '5432'),
        username: process.env.PG_USER,
        password: process.env.PG_PASS,
        database: process.env.PG_DB,
        entities: [Ingredient],
        synchronize: process.env.PG_MIGRATE === 'true',
    });
    await ds.initialize();

    cachedDs = ds;
    return ds;
}
