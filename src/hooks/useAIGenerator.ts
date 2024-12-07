import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';

export interface GenerateContentInput {
    chunks: string;
    apiKey: string;
    lectureId: string;
    title: string;
}
export const useAIGenerator = () => {
    const generateFlashcards = useMutation({
        mutationFn: async (data: GenerateContentInput) => {
            try {
                const response = await axios.post(
                    `${API_URL}/ai/generate/flashcards`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                return response.data;
            } catch (error: any) {
                console.error("Error generating flashcards:", error);
                throw new Error(error.response?.data?.message || "Failed to generate flashcards");
            }
        },
    });

    const generateQuiz = useMutation({
        mutationFn: async (data: GenerateContentInput) => {
            try {
                const response = await axios.post(
                    `${API_URL}/ai/generate/quiz`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                return response.data;
            } catch (error: any) {
                console.error("Error generating quiz:", error);
                throw new Error(error.response?.data?.message || "Failed to generate quiz");
            }
        },
    });

    return {
        generateFlashcards,
        generateQuiz,
    };
};
