import { FormEvent, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { InterviewSettings } from './InterviewSettings';
import { QuestionsList } from './QuestionsList';
import { InterviewResult } from './InterviewResult';
import type {
    AnswerRecord,
    Question,
    QuestionsCategories,
} from '@behavioral-interview/types';

import './App.css';

function App() {
    const [interviewSettingsVisible, setInterviewSettingsVisible] =
        useState(true);
    const [questionsListVisible, setQuestionsListVisible] = useState(false);
    const [interviewResultVisible, setInterviewResultVisible] = useState(false);
    const [categories, setCategories] = useState<QuestionsCategories[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [records, setRecords] = useState<AnswerRecord[]>([]);

    const handleSettingsSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        await getQuestions();
        setInterviewSettingsVisible(false);
        setQuestionsListVisible(true);
    };

    const getQuestions = async () => {
        const cats = categories.map(({ categoryId }) => categoryId);
        try {
            // @ts-ignore: Unreachable code error
            let url = `${__REACT_APP_API_URL__}/questions-interview`;
            if (cats.length) {
                url += `?categories=${cats}`;
            }
            const response = await fetch(url);
            const json: any[] = await response.json();
            setQuestions(json);
        } catch (error) {
            console.error(error);
        }
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
