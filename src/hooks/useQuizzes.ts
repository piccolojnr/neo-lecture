import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "../config";
import { Lecture } from "./useLectures";
interface Option {
  value: string
}
interface Question {
  id: string;
  question: string;
  options: Option[];
  answer: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  lectureId: string;
  lecture: Lecture;
  createdAt: string;
  updatedAt: string;
}

interface CreateQuizInput {
  title: string;
  lectureId: string;
  questions: Array<{
    question: string;
    options: Option[];
    answer: string;
  }>;
}

interface UpdateQuizInput {
  id: string;
  title: string;
  questions: Array<{
    question: string;
    options: Option[];
    answer: string;
  }>;
}

interface QuizAttempt {
  quizId: string;
  answers: {
    questionIndex: number;
    selectedAnswer: string;
  }[];
  score: number;
}

export const useQuizzes = () => {
  const queryClient = useQueryClient();

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const getQuiz = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["quiz", id],
      queryFn: async () => {
        if (!localStorage.getItem("token")) {
          throw new Error("Unauthorized");
        }
        if (!id) {
          throw new Error("Quiz ID is required");
        }
        const response = await axios.get<Quiz>(`${API_URL}/quizzes/${id}`, config);
        return response.data;
      },
    });

  const createQuiz = useMutation({
    mutationFn: async (data: CreateQuizInput) => {
      const response = await axios.post(`${API_URL}/quizzes`, data, config);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lecture", variables.lectureId] });
    },
  });

  const updateQuiz = useMutation({
    mutationFn: async ({ id, ...data }: UpdateQuizInput) => {
      const response = await axios.put(`${API_URL}/quizzes/${id}`, data, config);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", data.id] });
      queryClient.invalidateQueries({ queryKey: ["lecture", data.lectureId] });
    },
  });

  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${API_URL}/quizzes/${id}`, config);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", id] });
    },
  });

  const submitQuizAttempt = useMutation({
    mutationFn: async (data: QuizAttempt) => {
      const response = await axios.post(
        `${API_URL}/quizzes/${data.quizId}/attempts`,
        data,
        config
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ["quizAttempts"] });
    },
  });

  return {
    getQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
  };
};

export type { Quiz, Question, CreateQuizInput, UpdateQuizInput, Option };
