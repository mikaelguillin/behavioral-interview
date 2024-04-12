export interface AnswerFeedback {
    [component: string]: {
        good: string;
        improvement: string;
    };
}

export interface AnswerRecord {
    question: string;
    audioBlob: Blob;
    audioURL: string;
}
