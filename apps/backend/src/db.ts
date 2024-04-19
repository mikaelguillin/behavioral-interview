import { Db, MongoClient } from 'mongodb';

const mongoString = process.env.MONGODB_URI || '';
const client = new MongoClient(mongoString);
let conn: MongoClient;
let db: Db;

export async function connectToDB() {
    try {
        conn = await client.connect();
        db = conn.db('behavioral-interview');
        return db;
    } catch (e) {
        console.error(e);
    }

    return null;
}

export function getDB() {
    return db;
}
