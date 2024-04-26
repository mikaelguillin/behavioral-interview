import { MouseEvent, useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';

import LoadingButton from '@mui/lab/LoadingButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { AnswerRecord, AnswerFeedback } from '@behavioral-interview/types';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { useTranslation } from 'react-i18next';

export const InterviewResult = ({
    records,
    onRestart,
}: {
    visible?: boolean;
    records: AnswerRecord[];
    onRestart: () => void;
}) => {
    const [feedbacks, setFeedbacks] = useState<AnswerFeedback[]>([]);
    const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);
    const { t } = useTranslation();

    const handleFeedbackClick = async (
        // @ts-ignore:no-unused-variable
        e: MouseEvent<HTMLButtonElement>,
        { audioBlob, question }: AnswerRecord
    ) => {
        try {
            setFeedbackLoading(true);
            const audioFile = new File([audioBlob], 'audio.wav', {
                type: 'audio/wav',
                lastModified: Date.now(),
            });
            const data = new FormData();
            data.append('audio', audioFile);
            data.append('questionId', question._id);

            // @ts-ignore: Unreachable code error
            const response = await fetch(`${__REACT_APP_API_URL__}/feedback`, {
                method: 'POST',
                body: data,
            });

            const json = await response.json();

            setFeedbacks([...feedbacks, json]);
        } catch (error) {
            console.error(error);
        } finally {
            setFeedbackLoading(false);
        }
    };

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <Typography variant="h3" marginBottom={5}>
                    {t('result.title')}
                </Typography>

                {records.map((record, i) => {
                    const currentFeedback = feedbacks.find(
                        (f) => f.questionId === record.question._id
                    );
                    return (
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
                                    {record.question.question}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className="record">
                                    <audio
                                        controls
                                        src={record.audioURL}
                                    ></audio>
                                    {!currentFeedback && (
                                        <LoadingButton
                                            type="button"
                                            loading={feedbackLoading}
                                            loadingPosition="end"
                                            endIcon={<ChecklistIcon />}
                                            className="btn-feedback"
                                            variant="contained"
                                            onClick={(e) =>
                                                handleFeedbackClick(e, record)
                                            }
                                        >
                                            {t('result.getfeedback')}
                                        </LoadingButton>
                                    )}
                                </div>
                                <Box marginTop={2}>
                                    {currentFeedback &&
                                        Object.entries(
                                            currentFeedback.starFeedback
                                        ).map(
                                            (
                                                [
                                                    component,
                                                    { good, improvement },
                                                ],
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
                                                                    {t(
                                                                        'result.whatyouhavedonewell'
                                                                    )}
                                                                </b>
                                                            </Typography>
                                                            <Typography>
                                                                {good}
                                                            </Typography>
                                                        </>
                                                    )}

                                                    {improvement && (
                                                        <>
                                                            <Typography>
                                                                <b>
                                                                    {t(
                                                                        'result.whatyoucanimprove'
                                                                    )}
                                                                </b>
                                                            </Typography>
                                                            <Typography>
                                                                {improvement}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Box>
                                            )
                                        )}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
                <Button
                    onClick={onRestart}
                    variant="contained"
                    style={{ marginTop: '40px' }}
                >
                    {t('result.startnewinterview')}
                </Button>
            </div>
        </>
    );
};
