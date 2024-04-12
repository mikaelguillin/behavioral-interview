import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import multer from 'multer';

import fs from 'fs';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileSuffix = '.wav';
        cb(null, file.fieldname + '-' + uniqueSuffix + fileSuffix);
    },
});

const upload = multer({ storage });

async function analyzeSTAR(audio: Express.Multer.File, question: string) {
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(`./uploads/${audio.filename}`),
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

// async function giveExample(question: string) {
//     try {
//         const response = await openai.chat.completions.create({
//             model: 'gpt-3.5-turbo',
//             messages: [
//                 {
//                     role: 'system',
//                     content: `
//             You are an expert in assessment and advice for behavioral interviews.
//             The user will provide you a question delimited with XML tags.
//             Write a JSON with a 'example' root property with a property for each component of S.T.A.R.
//           `,
//                 },
//                 {
//                     role: 'user',
//                     content: `Give me an example of answer based on the S.T.A.R. framework for the <question>${question}</question>`,
//                 },
//             ],
//         });
//     } catch (error) {
//         console.error('Error for giving an example', error);
//         return null;
//     }
// }

// // Call the function and log the results
// // analyzeSTAR("./uploads/audio-1711486536687-183865559.wav", "", trans)
// //   .then((starElements) => {
// //     console.log("S.T.A.R. Elements:", starElements);
// //   })
// //   .catch((error) => {
// //     console.error("Error:", error);
// //   });

app.post('/feedback', upload.single('audio'), async (req, res) => {
    const { question } = req.body;
    const audio = req.file;

    try {
        if (audio) {
            const starElements = await analyzeSTAR(audio, question);
            res.json(starElements);
        }
    } catch (error) {
        console.error('Error giving feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// app.get('/transcription', async (req, res) => {
//     try {
//         const transcription = await openai.audio.transcriptions.create({
//             file: fs.createReadStream(`./uploads/${audio.filename}`),
//             model: 'whisper-1',
//             language: 'en', // this is optional but helps the model
//         });

//         const transcriptionText = transcription.text;

//         res.text(transcriptionText);
//     } catch (error) {
//         console.error('Error for giving an example', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
