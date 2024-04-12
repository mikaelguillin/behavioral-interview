import { MouseEvent, useState } from 'react';
import {
    Button,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { AnswerRecord } from '@behavioral-interview/types';

interface AnswerFeedback {
    [component: string]: {
        good: string;
        improvement: string;
    };
}

export const InterviewResult = ({
    records,
    onRestart,
}: {
    visible?: boolean;
    records: AnswerRecord[];
    onRestart: () => void;
}) => {
    const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);

    const handleFeedbackClick = async (
        e: MouseEvent<HTMLButtonElement>,
        { audioBlob, question }: AnswerRecord
    ) => {
        try {
            const audioFile = new File([audioBlob], 'audio.wav', {
                type: 'audio/wav',
                lastModified: Date.now(),
            });
            const data = new FormData();
            data.append('audio', audioFile);
            data.append('question', question);
            // @ts-ignore: Unreachable code error
            const response = await fetch(`${__REACT_APP_API_URL__}/feedback`, {
                method: 'POST',
                body: data,
            });
            const json = await response.json();
            setFeedback(json.feedback);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <Typography variant="h3" marginBottom={5}>
                    Interview feedback
                </Typography>

                {records.map((record, i) => (
                    <Accordion
                        key={`record-${i}`}
                        style={{ textAlign: 'left' }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography
                                className="question"
                                variant="h6"
                                marginBottom={2}
                            >
                                <b>
                                    {i + 1}/{records.length}
                                </b>{' '}
                                {record.question}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="record">
                                <audio controls src={record.audioURL}></audio>
                                <Button
                                    type="button"
                                    className="btn-feedback"
                                    variant="outlined"
                                    onClick={(e) =>
                                        handleFeedbackClick(e, record)
                                    }
                                >
                                    Get feedback on my answer
                                </Button>
                            </div>
                            <Box marginTop={2}>
                                {feedback &&
                                    Object.entries(feedback).map(
                                        (
                                            [component, { good, improvement }],
                                            j
                                        ) => (
                                            <Box
                                                marginBottom={2}
                                                key={`feedback-component-${j}`}
                                            >
                                                <Typography variant="h6">
                                                    <b>{component}</b>
                                                </Typography>
                                                {good && (
                                                    <>
                                                        <Typography>
                                                            <b>
                                                                What you've done
                                                                well
                                                            </b>
                                                        </Typography>
                                                        <Typography>
                                                            {good}
                                                        </Typography>
                                                    </>
                                                )}

                                                <Typography>
                                                    <b>What you can improve</b>
                                                </Typography>
                                                <Typography>
                                                    {improvement}
                                                </Typography>
                                            </Box>
                                        )
                                    )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
                <Button
                    onClick={onRestart}
                    variant="contained"
                    style={{ marginTop: '40px' }}
                >
                    Start a new interview
                </Button>
            </div>
        </>
    );
};
