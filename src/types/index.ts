export interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  flashcards: Flashcard[];
}

export interface Question {
  id: string;
  question: string;
  options: string;
  answer: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface Lecture {
  id: string;
  title: string;
  description?: string;
  files: File[];
  flashcardSets: FlashcardSet[];
  quizzes: Quiz[];
  createdAt: string;
  updatedAt: string;
  _count: {
    flashcardSets: number;
    quizzes: number;
    files: number;
  };
}
