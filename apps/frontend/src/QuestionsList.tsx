import { useRef, useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import type { AnswerRecord, Question } from '@behavioral-interview/types';

export const QuestionsList = ({
    questions,
    records,
    onDeleteRecord,
    onRecord,
    onSubmit,
}: {
    visible?: boolean;
    questions: Question[];
    records: AnswerRecord[];
    onDeleteRecord: (record: AnswerRecord) => void;
    onRecord: (record: AnswerRecord) => void;
    onSubmit: () => void;
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [indexQuestion, setIndexQuestion] = useState(0);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    // const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
    // const intervalRef = useRef<number>(0);

    useEffect(() => {
        return () => {
            if (mediaRecorder.current) {
                mediaRecorder.current.stream
                    .getAudioTracks()
                    .forEach((track) => {
                        track.stop();
                    });
            }
        };
    }, []);

    // const startTimer = () => {
    //     intervalRef.current = setInterval(() => {
    //         setTimer((prevTime) => {
    //             const newSeconds = prevTime.seconds + 1;
    //             if (newSeconds === 60) {
    //                 return { minutes: prevTime.minutes + 1, seconds: 0 };
    //             }
    //             return { ...prevTime, seconds: newSeconds };
    //         });
    //     }, 1000);
    // };

    // const stopTimer = () => {
    //     clearInterval(intervalRef.current);
    // };

    // const timerElement = `${timer.minutes
    //     .toString()
    //     .padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`;

    const currentQuestion = questions[indexQuestion];
    const currentRecord = records[indexQuestion];

    const startRecording = () => {
        const audioChunks: Blob[] = [];
        const streamPromise = navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        streamPromise
            .then((stream) => {
                setIsRecording(true);
                // startTimer();
                mediaRecorder.current = new MediaRecorder(stream);
                mediaRecorder.current.ondataavailable = function (event) {
                    audioChunks.push(event.data);
                };
                mediaRecorder.current.onstop = function () {
                    const audioBlob = new Blob(audioChunks, {
                        type: 'audio/wav',
                    });
                    const audioURL = URL.createObjectURL(audioBlob);
                    onRecord({
                        question: currentQuestion,
                        audioBlob,
                        audioURL,
                    });
                    audioChunks.length = 0;
                };
                mediaRecorder.current.start();
            })
            .catch((error) => {
                console.error('Error accessing user media:', error);
            });
    };

    const stopRecording = () => {
        if (
            mediaRecorder.current &&
            mediaRecorder.current.state === 'recording'
        ) {
            // stopTimer();
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    const deleteAndRecordAgain = () => {
        onDeleteRecord(currentRecord);
        if (
            mediaRecorder.current &&
            mediaRecorder.current.state === 'inactive'
        ) {
            mediaRecorder.current.start();
            setIsRecording(true);
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Typography variant="h6" marginBottom={3}>
                <b>
                    {indexQuestion + 1}/{questions.length}
                </b>{' '}
                {currentQuestion.question}
            </Typography>

            {!isRecording && currentRecord && (
                <div style={{ marginBottom: '20px' }}>
                    <audio controls src={currentRecord.audioURL}></audio>
                </div>
            )}

            {isRecording ? (
                <Button
                    style={{ marginRight: '20px' }}
                    variant="outlined"
                    className="btn-recording"
                    startIcon={<MicIcon />}
                    onClick={stopRecording}
                >
                    {/* {timerElement} Stop recording */}
                    Stop recording
                </Button>
            ) : currentRecord ? (
                <>
                    <Button
                        style={{ marginRight: '20px' }}
                        variant="outlined"
                        startIcon={<MicIcon />}
                        onClick={deleteAndRecordAgain}
                    >
                        Restart recording
                    </Button>
                </>
            ) : (
                <Button
                    style={{ marginRight: '20px' }}
                    variant="contained"
                    startIcon={<MicIcon />}
                    onClick={startRecording}
                >
                    Record your answer
                </Button>
            )}

            {currentRecord &&
                (indexQuestion + 1 >= questions.length ? (
                    <Button
                        disabled={isRecording}
                        variant="contained"
                        onClick={onSubmit}
                        endIcon={<KeyboardArrowRightIcon />}
                    >
                        Submit and get results
                    </Button>
                ) : (
                    <Button
                        disabled={isRecording}
                        variant="contained"
                        onClick={() => setIndexQuestion(indexQuestion + 1)}
                        endIcon={<KeyboardArrowRightIcon />}
                    >
                        Submit answer
                    </Button>
                ))}
        </div>
    );
};
