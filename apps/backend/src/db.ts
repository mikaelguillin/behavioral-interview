import { Db, MongoClient } from 'mongodb';

const mongoString = process.env.DATABASE_URL || '';
const client = new MongoClient(mongoString);
let conn: MongoClient;
let db: Db;

export async function connectToDB() {
    try {
        conn = await client.connect();
        db = conn.db('behavioral-interview');
        return true;
    } catch (e) {
        console.error(e);
    }

    return false;
}

export function getDB() {
    return db;
}
