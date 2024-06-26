import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import multer from 'multer';
import cors from 'cors';
import { Document, ObjectId } from 'mongodb';
import connectToDB from './db';
const { File } = require('@web-std/file');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer();

async function analyzeSTAR(audio: Express.Multer.File, question: string) {
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: new File([audio.buffer], 'audio.wav'),
            model: 'whisper-1',
            language: 'en', // this is optional but helps the model
        });

        const transcriptionText = transcription.text;

        // Send text to ChatGPT for analysis

        // Give your feedback by delimiting each component of S.T.A.R. with XML tags.
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `
            You are an expert in assessment and advice for behavioral interviews.
            The user will provide you with questions and answers delimited with XML tags.
            Write a JSON with a 'feedback' root property and for each component of S.T.A.R., put any good elements of the answer, if any, in the 'good' property and what can be improved in the 'improvement' property.
          `,
                },
                {
                    role: 'user',
                    content: `Give me a feedback on my answer <answer>${transcriptionText}</answer> to this question <question>${question}</question>`,
                },
            ],
        });

        // Return the S.T.A.R. elements
        return JSON.parse(response.choices[0].message.content as string);
    } catch (error) {
        console.error('Error analyzing S.T.A.R. elements:', error);
        return null;
    }
}

app.post(
    '/feedback',
    upload.single('audio'),
    async (req: Request, res: Response) => {
        const { questionId } = req.body;
        const audio = req.file;

        try {
            const { mongoClient } = await connectToDB();

            if (!mongoClient)
                throw new Error(
                    'An error occured while connecting to database'
                );

            const db = mongoClient.db('behavioral-interview');
            const question = await db
                .collection('questions')
                .findOne({ _id: new ObjectId(questionId as string) });

            if (audio && question) {
                const starFeedback = await analyzeSTAR(
                    audio,
                    question.question
                );
                const json = {
                    questionId,
                    starFeedback: starFeedback.feedback,
                };
                res.json(json);
            }
        } catch (error) {
            console.error('Error giving feedback:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

app.get('/questions-categories', async (req: Request, res: Response) => {
    try {
        const { mongoClient } = await connectToDB();

        if (!mongoClient)
            throw new Error('An error occured while connecting to database');

        const db = mongoClient.db('behavioral-interview');
        const data = await db
            .collection('questions-categories')
            .find({})
            .toArray();
        res.send(data);
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/questions-interview', async (req: Request, res: Response) => {
    const { categories } = req.query;

    const cats = categories?.length
        ? ((categories as string) || '').split(',').map((c) => parseInt(c, 10))
        : '';

    const nbCategories = cats.length;
    const size = 5;
    try {
        const aggregateArray: Document[] = [];

        if (nbCategories) {
            aggregateArray.push({
                $match: { categoryId: { $in: cats } },
            });
        }

        if (nbCategories > 1) {
            aggregateArray.push(
                {
                    $group: {
                        _id: '$categoryId',
                        questions: {
                            $push: '$$ROOT',
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        questions: {
                            $slice: [
                                '$questions',
                                {
                                    $min: [
                                        {
                                            $subtract: [
                                                '$count',
                                                {
                                                    $ceil: {
                                                        $divide: [
                                                            size,
                                                            nbCategories,
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                        {
                                            $floor: {
                                                $multiply: [
                                                    { $rand: {} },
                                                    '$count',
                                                ],
                                            },
                                        },
                                    ],
                                },
                                {
                                    $ceil: {
                                        $divide: [size, nbCategories],
                                    },
                                },
                            ],
                        },
                    },
                },
                { $unwind: '$questions' }, // Unwind the sampled documents array
                { $replaceRoot: { newRoot: '$questions' } } // Replace the root with the sampled documents
            );
        }

        aggregateArray.push({ $sample: { size } });

        const { mongoClient } = await connectToDB();

        if (!mongoClient)
            throw new Error('An error occured while connecting to database');

        const db = mongoClient.db('behavioral-interview');
        const data = await db
            .collection('questions')
            .aggregate(aggregateArray)
            .toArray();
        res.send(data);
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
});

export default app;
