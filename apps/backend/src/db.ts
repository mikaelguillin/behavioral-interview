import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI || '';
const options = {};

let mongoClient: MongoClient;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

export default async function connectToDB() {
    try {
        if (mongoClient) {
            return { mongoClient };
        }
        mongoClient = await new MongoClient(uri, options).connect();
        console.log('Just connected!');
        return { mongoClient };
    } catch (error) {
        console.error(error);
    }

    return { mongoClient: null };
}
