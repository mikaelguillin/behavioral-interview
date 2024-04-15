interface AnswerFeedbackComponent {
    good: string;
    improvement: string;
}

interface AnswerFeedbackSTAR {
    situation: AnswerFeedbackComponent;
    task: AnswerFeedbackComponent;
    action: AnswerFeedbackComponent;
    result: AnswerFeedbackComponent;
}

export interface AnswerFeedback {
    questionId: string;
    starFeedback: AnswerFeedbackSTAR;
}

export interface AnswerRecord {
    question: Question;
    audioBlob: Blob;
    audioURL: string;
}

export interface Question {
    _id: string;
    categoryId: string;
    question: string;
}

export interface QuestionsCategories {
    _id: string;
    label: string;
    value: string;
    categoryId: string;
}
