import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Option, Question, useQuizzes } from "../../hooks/useQuizzes";
import Breadcrumb from "../common/Breadcrumb";

interface UserAnswer {
  questionIndex: number;
  selectedAnswer: string;
}

export default function QuizView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuiz, submitQuizAttempt } = useQuizzes();
  const { data: quiz, isLoading } = getQuiz(id!);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      const existingAnswerIndex = newAnswers.findIndex(
        (a) => a.questionIndex === currentQuestionIndex
      );

      if (existingAnswerIndex !== -1) {
        newAnswers[existingAnswerIndex].selectedAnswer = answer;
      } else {
        newAnswers.push({
          questionIndex: currentQuestionIndex,
          selectedAnswer: answer,
        });
      }

      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    const correctAnswers = userAnswers.filter((answer) => {
      const question = quiz.questions[answer.questionIndex];
      return question.answer === answer.selectedAnswer;
    });
    return (correctAnswers.length / quiz.questions.length) * 100;
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    if (userAnswers.length !== quiz.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      const finalScore = calculateScore();
      setScore(finalScore);
      setQuizSubmitted(true);

      // Submit quiz attempt to backend
      await submitQuizAttempt.mutateAsync({
        quizId: id!,
        answers: userAnswers.map((answer) => ({
          questionIndex: answer.questionIndex,
          selectedAnswer: answer.selectedAnswer,
        })),
        score: finalScore,
      });
    } catch (error) {
      setError("Failed to submit quiz. Please try again.");
      console.error("Submit quiz error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Quiz not found.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const userAnswer = userAnswers.find(
    (a) => a.questionIndex === currentQuestionIndex
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {quiz && (
        <>
          <Breadcrumb
            items={[
              {
                name: "Dashboard",
                href: "/dashboard",
              },
              {
                name: quiz.lecture.title,
                href: `/lectures/${quiz.lecture.id}`,
              },
              {
                name: quiz.title,
                href: `/quizzes/${quiz.id}`,
              },
            ]}
          />
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </p>
                {!quizSubmitted && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                    <span className="text-sm text-gray-500">Not submitted</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {quizSubmitted ? (
              <div className="space-y-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Quiz Complete!
                  </h2>
                  <p className="text-4xl font-bold text-indigo-600 mb-4">
                    {score?.toFixed(1)}%
                  </p>
                  <p className="text-gray-600">
                    You answered {userAnswers.length} questions
                  </p>
                </div>

                <div className="space-y-4">
                  {quiz.questions.map((question: Question, index: number) => {
                    const answer = userAnswers.find(
                      (a) => a.questionIndex === index
                    );
                    const isCorrect =
                      answer?.selectedAnswer === question.answer;

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          isCorrect ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        <p className="font-medium mb-2">{question.question}</p>
                        <p className="text-sm">
                          Your answer:{" "}
                          <span
                            className={
                              isCorrect ? "text-green-600" : "text-red-600"
                            }
                          >
                            {answer?.selectedAnswer}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Correct answer: {question.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/lectures/${quiz.lectureId}`)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Return to Lecture
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-lg font-medium mb-4">
                    {currentQuestion.question}
                  </p>
                  <div className="space-y-3">
                    {currentQuestion.options.map(
                      (option: Option, index: any) => {
                        const optionValue = option.value.trim();
                        return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(optionValue)}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                              userAnswer?.selectedAnswer === optionValue
                                ? "bg-indigo-100 border-2 border-indigo-500"
                                : "bg-white border-2 border-gray-200 hover:border-indigo-200"
                            }`}
                          >
                            {optionValue}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      currentQuestionIndex === 0
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>

                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
