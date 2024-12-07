import { API_URL } from '../config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';


interface Lecture {
  id: string;
  title: string;
  description?: string;
  files: Array<{
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  }>;
  flashcardSets: Array<{
    id: string;
    title: string;
    flashcards: Array<{
      id: string;
      front: string;
      back: string;
    }>;
    createdAt: string;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    questions: Array<{
      id: string;
      question: string;
      options: string;
      answer: string;
    }>;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  _count: {
    flashcardSets: number;
    quizzes: number;
    files: number;
  };
}

export const useLectures = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLectures = useQuery({
    queryKey: ["lectures"],
    queryFn: async () => {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<Lecture[]>(`${API_URL}/lectures`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      },
      );

      setIsLoading(false);
      return response.data;
    },
  });

  const getLecture = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["lecture", id],
      queryFn: async () => {
        if (!localStorage.getItem("token")) {
          throw new Error("Unauthorized");
        }
        if (!id) {
          throw new Error("Lecture ID is required");
        }
        const response = await axios.get<Lecture>(`${API_URL}/lectures/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });
        return response.data;
      },
      enabled: !!id,
    });

  const createLecture = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const response = await axios.post(`${API_URL}/lectures`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
    },
  });

  const deleteLecture = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${API_URL}/lectures/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
    },
  });

  const addFiles = useMutation({
    mutationFn: async ({
      lectureId,
      formData,
    }: {
      lectureId: string;
      formData: FormData;
    }) => {
      const response = await axios.post(
        `${API_URL}/lectures/${lectureId}/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lecture", variables.lectureId] });
    },
  });

  const deleteFile = useMutation({
    mutationFn: async ({
      lectureId,
      fileId,
    }: {
      lectureId: string;
      fileId: string;
    }) => {
      const response = await axios.delete(
        `${API_URL}/lectures/${lectureId}/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lecture", variables.lectureId] });
    },
  });

  return {
    getLectures,
    getLecture,
    createLecture,
    deleteLecture,
    addFiles,
    deleteFile,
    error,
    isLoading,
  };
};

export type { Lecture };
