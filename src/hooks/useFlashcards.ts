import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Lecture } from './useLectures';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  flashcardReview: {
    confidence: number;
  }[]
}

interface FlashcardSet {
  id: string;
  title: string;
  flashcards: Flashcard[];
  lectureId: string;
  lecture: Lecture;
  createdAt: string;
  updatedAt: string;
}

interface CreateFlashcardSetInput {
  title: string;
  lectureId: string;
  flashcards: Array<{
    front: string; back: string,

  }>;
}

interface UpdateFlashcardSetInput {
  id: string;
  title: string;
  flashcards: Array<{ front: string; back: string }>;
}

export const useFlashcards = () => {
  const queryClient = useQueryClient();

  const getFlashcardSet = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['flashcardSet', id],
      queryFn: async () => {
        const response = await axios.get<FlashcardSet>(`${API_URL}/flashcards/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
        });
        return response.data;
      },
    });

  const createFlashcardSet = useMutation({
    mutationFn: async (data: CreateFlashcardSetInput) => {
      const response = await axios.post(`${API_URL}/flashcards`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lecture', variables.lectureId] });
    },
  });

  const updateFlashcardSet = useMutation({
    mutationFn: async ({ id, ...data }: UpdateFlashcardSetInput) => {
      const response = await axios.put(`${API_URL}/flashcards/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSet', data.id] });
      queryClient.invalidateQueries({ queryKey: ['lecture', data.lectureId] });
    },
  });

  const deleteFlashcardSet = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${API_URL}/flashcards/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSet', id] });
    },
  });

  return {
    getFlashcardSet,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
  };
};

export type { FlashcardSet, Flashcard, CreateFlashcardSetInput, UpdateFlashcardSetInput };
