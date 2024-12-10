import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "../../config";
import { Quiz } from "../../hooks/useQuizzes";
import Breadcrumb from "../common/Breadcrumb";

interface QuizAttempt {
  id: string;
  quiz: Quiz;
  score: number;
  createdAt: string;
}

interface FlashcardReview {
  id: string;
  confidence: number;
  createdAt: string;
  nextReview: string;
}

interface FlashcardProgress {
  setId: string;
  title: string;
  lecture: {
    id: string;
    title: string;
  };
  reviews: FlashcardReview[];
}

export default function Progress() {
  const [activeTab, setActiveTab] = useState<"quizzes" | "flashcards">(
    "quizzes"
  );

  const { data: quizAttempts, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ["quizAttempts"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/users/quiz/attempts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return response.data;
    },
  });

  const { data: flashcardProgress, isLoading: isLoadingFlashcards } = useQuery({
    queryKey: ["flashcardProgress"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/users/flashcard/progress`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
  });

  const groupedAttempts: { [key: string]: QuizAttempt[] } | undefined =
    quizAttempts?.reduce(
      (acc: { [key: string]: QuizAttempt[] }, attempt: QuizAttempt) => {
        const quizId = attempt.quiz.id;
        if (!acc[quizId]) {
          acc[quizId] = [];
        }
        acc[quizId].push(attempt);
        return acc;
      },
      {}
    );

  const calculateAverageScore = (attempts: QuizAttempt[]) => {
    const sum = attempts.reduce((acc, attempt) => acc + attempt.score, 0);
    return (sum / attempts.length).toFixed(1);
  };

  const calculateAverageConfidence = (reviews: FlashcardReview[]) => {
    const sum = reviews.reduce((acc, review) => acc + review.confidence, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 4) return "text-green-600";
    if (confidence >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          {
            name: "Dashboard",
            href: "/dashboard",
          },
          {
            name: "Progress",
            href: "/progress",
          },
        ]}
      />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px ml-8">
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "quizzes"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Quizzes
            </button>
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "flashcards"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Flashcards
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "quizzes" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Quiz Performance
              </h2>

              {isLoadingQuizzes ? (
                <div className="text-center py-4">Loading...</div>
              ) : !groupedAttempts ||
                Object.keys(groupedAttempts).length === 0 ? (
                <p className="text-gray-500">No quiz attempts yet.</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedAttempts).map(([quizId, attempts]) => {
                    const quiz = attempts[0].quiz;
                    const averageScore = calculateAverageScore(attempts);

                    return (
                      <div
                        key={quizId}
                        className="bg-gray-50 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start flex-wrap">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {quiz.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {quiz.lecture.title}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-semibold text-indigo-600">
                              {averageScore}%
                            </p>
                            <p className="text-sm text-gray-500">
                              Average Score
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Recent Attempts
                          </h4>
                          <div className="space-y-2">
                            {attempts.slice(0, 3).map((attempt) => (
                              <div
                                key={attempt.id}
                                className="flex justify-between items-center text-sm flex-wrap"
                              >
                                <span className="text-gray-500">
                                  {new Date(
                                    attempt.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                <span
                                  className={`font-medium ${
                                    attempt.score >= 70
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {attempt.score}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "flashcards" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Flashcard Progress
              </h2>

              {isLoadingFlashcards ? (
                <div className="text-center py-4">Loading...</div>
              ) : !flashcardProgress || flashcardProgress.length === 0 ? (
                <p className="text-gray-500">No flashcard reviews yet.</p>
              ) : (
                <div className="space-y-6">
                  {flashcardProgress.map((progress: FlashcardProgress) => {
                    const averageConfidence = calculateAverageConfidence(
                      progress.reviews
                    );
                    const confidenceColor = getConfidenceColor(
                      parseFloat(averageConfidence)
                    );

                    return (
                      <div
                        key={progress.setId}
                        className="bg-gray-50 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start flex-wrap">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {progress.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {progress.lecture.title}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p
                              className={`text-lg font-semibold ${confidenceColor}`}
                            >
                              {averageConfidence}
                            </p>
                            <p className="text-sm text-gray-500">
                              Average Confidence
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Recent Reviews
                          </h4>
                          <div className="space-y-2">
                            {progress.reviews.slice(0, 3).map((review) => (
                              <div
                                key={review.id}
                                className="flex justify-between items-center text-sm flex-wrap"
                              >
                                <span className="text-gray-500">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                <div className="flex items-center space-x-4 flex-wrap">
                                  <span
                                    className={`font-medium ${getConfidenceColor(
                                      review.confidence
                                    )}`}
                                  >
                                    Level {review.confidence}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    Next review:{" "}
                                    {new Date(
                                      review.nextReview
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
