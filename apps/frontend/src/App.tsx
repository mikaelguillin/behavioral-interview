import { FormEvent, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { InterviewSettings } from './InterviewSettings';
import { QuestionsList } from './QuestionsList';
import { shuffle } from 'lodash';
import questionsJson from './assets/questions.json';
import { InterviewResult } from './InterviewResult';
import type { AnswerRecord } from '@behavioral-interview/types';

import './App.css';

const questsJson: Record<string, string[]> = questionsJson;

function getQuestions(categories: string[], nbQuestions: number) {
    const questions: string[] = [];
    const nbCategories = categories.length;

    if (nbCategories) {
        const nbOfQuestionsForEachCategory = Math.floor(
            nbQuestions / nbCategories
        );

        for (let i = 0; i < nbCategories; i++) {
            const questionsSet = questsJson[categories[i]];
            for (let j = 0; j <= nbOfQuestionsForEachCategory; j++) {
                questions.push(questionsSet[j]);
            }
        }

        return shuffle(questions).slice(0, nbQuestions);
    }

    return shuffle(Object.values(questsJson).flat()).slice(0, nbQuestions);
}

function App() {
    const [interviewSettingsVisible, setInterviewSettingsVisible] =
        useState(true);
    const [questionsListVisible, setQuestionsListVisible] = useState(false);
    const [interviewResultVisible, setInterviewResultVisible] = useState(false);
    const [categories, setCategories] = useState<
        { label: string; value: string }[]
    >([]);
    const [questions, setQuestions] = useState<string[]>([]);
    const [records, setRecords] = useState<AnswerRecord[]>([]);
    const nbQuestions = 5;

    const handleSettingsSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setQuestionsListVisible(true);
        setInterviewSettingsVisible(false);
        setQuestions(
            getQuestions(
                categories.map((c) => c.value),
                nbQuestions
            )
        );
    };

    const handleRecord = (record: AnswerRecord) => {
        setRecords([...records, record]);
    };

    const handleQuestionsSubmit = () => {
        setQuestionsListVisible(false);
        setInterviewResultVisible(true);
    };

    const handleRestart = () => {
        setRecords([]);
        setInterviewResultVisible(false);
        setInterviewSettingsVisible(true);
    };

    const handleDeleteRecord = (record: AnswerRecord) => {
        setRecords(records.filter((r) => r.question !== record.question));
    };

    return (
        <>
            <CssBaseline />
            {interviewSettingsVisible && (
                <InterviewSettings
                    categories={categories}
                    onCategoriesChange={setCategories}
                    onSubmit={handleSettingsSubmit}
                />
            )}

            {questionsListVisible && (
                <QuestionsList
                    questions={questions}
                    records={records}
                    onDeleteRecord={handleDeleteRecord}
                    onRecord={handleRecord}
                    onSubmit={handleQuestionsSubmit}
                />
            )}

            {interviewResultVisible && (
                <InterviewResult records={records} onRestart={handleRestart} />
            )}
        </>
    );
}

export default App;
