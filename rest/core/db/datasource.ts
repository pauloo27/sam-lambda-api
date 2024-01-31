import { DataSource } from 'typeorm';
import { Ingredient } from '../../entities/ingredient';

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
    });
    await ds.initialize();

    console.log(JSON.stringify({ migrate: process.env.PG_MIGRATE, a: process.env.PG_DB }));
    if (process.env.PG_MIGRATE === 'true') {
        console.log(JSON.stringify({ msg: 'Migrating...' }));
        await ds.synchronize();
    }

    cachedDs = ds;
    return ds;
}
