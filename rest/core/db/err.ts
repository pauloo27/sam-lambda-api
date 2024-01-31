export const DB_ERR_UQ_VIOLATION = '23505';
export const DB_ERR_FK_VIOLATION = '23503';

function checkErr(err: any, expectedCode: string): boolean {
    if (!('code' in err)) {
        return false;
    }

    return (err as { code: any }).code === expectedCode;
}

export function isUniqueErr(err: any): boolean {
    return checkErr(err, DB_ERR_UQ_VIOLATION);
}

export function isFkErr(err: any): boolean {
    return checkErr(err, DB_ERR_FK_VIOLATION);
}
