import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Option, useQuizzes } from "../../hooks/useQuizzes";
import Breadcrumb from "../common/Breadcrumb";

interface Question {
  question: string;
  options: Option[];
  answer: string;
}

export default function QuizEdit() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const { getQuiz, updateQuiz, deleteQuiz } = useQuizzes();

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { data: quiz, isLoading } = getQuiz(id!);

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setQuestions(
        quiz.questions.map((q: any) => {
          return {
            question: q.question,
            options: q.options,
            answer: q.answer,
          };
        })
      );
    }
  }, [quiz]);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", options: [{ value: "" }, { value: "" }], answer: "" },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  // Validation Functions
  const validateTitle = () => title.trim().length > 0;
  const validateQuestion = (q: Question) =>
    q.question.trim().length > 0 &&
    q.options.every((opt) => opt.value.trim().length > 0) &&
    q.answer.trim().length > 0;

  const isFormValid = () => {
    if (!validateTitle()) return false;
    return questions.every(validateQuestion);
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options[oIndex].value = value;
      // If correct answer doesn't match any option now, reset it
      if (
        !updated[qIndex].options.some(
          (opt) => opt.value === updated[qIndex].answer
        )
      ) {
        updated[qIndex].answer = "";
      }
      return updated;
    });
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options.push({ value: "" });
      return updated;
    });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options.splice(oIndex, 1);
      // Reset answer if it no longer matches an existing option
      if (
        !updated[qIndex].options.some(
          (opt) => opt.value === updated[qIndex].answer
        )
      ) {
        updated[qIndex].answer = "";
      }
      return updated;
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setError(null);

    if (!isFormValid()) {
      setError("Please fill in all required fields before updating the quiz.");
      return;
    }

    try {
      await updateQuiz.mutateAsync({
        id: id!,
        title,
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
        })),
      });
      navigate(`/quizzes/${id}`);
    } catch (error) {
      setError("Failed to update quiz");
      console.error("Update quiz error:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await deleteQuiz.mutateAsync(id!);
        navigate("/lectures/" + quiz?.lecture.id);
      } catch (error) {
        console.error("Delete quiz error:", error);
      }
    }
  };

  const isPending = updateQuiz.isPending;

  // Helper for styling inputs and textareas
  const getInputClasses = (isValid: boolean) => {
    const baseClasses =
      "w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow";
    const borderClass =
      !hasSubmitted || isValid ? "border-slate-200" : "border-red-500";
    return `${baseClasses} ${borderClass}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {quiz && (
        <>
          <Breadcrumb
            items={[
              {
                name: "Dashboard",
                href: "/dashbord",
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
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>

              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete Quiz
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <div className="w-full  min-w-[200px]">
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={getInputClasses(validateTitle())}
                    placeholder="Enter quiz title"
                  />
                </div>
                {hasSubmitted && !validateTitle() && (
                  <p className="text-red-500 text-sm mt-1">
                    Title is required.
                  </p>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {questions.map((q, qIndex) => {
                  const questionValid = validateQuestion(q);
                  return (
                    <div
                      key={qIndex}
                      className="bg-gray-50 p-4 rounded-lg shadow-inner"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-gray-800">
                          Question {qIndex + 1}
                        </h3>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Question text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question <span className="text-red-500">*</span>
                          </label>
                          <div className="w-full min-w-[200px]">
                            <textarea
                              value={q.question}
                              onChange={(e) =>
                                handleQuestionChange(
                                  qIndex,
                                  "question",
                                  e.target.value
                                )
                              }
                              className={getInputClasses(
                                q.question.trim().length > 0
                              )}
                              rows={2}
                              placeholder="Enter the quiz question here"
                            />
                          </div>
                          {hasSubmitted && q.question.trim().length === 0 && (
                            <p className="text-red-500 text-sm mt-1">
                              A question is required.
                            </p>
                          )}
                        </div>

                        {/* Options */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Options <span className="text-red-500">*</span>
                          </label>
                          <p className="text-sm text-gray-500 mb-2">
                            Add at least two options. Mark the correct one
                            below.
                          </p>
                          {q.options.map((opt, oIndex) => {
                            const optionValid = opt.value.trim().length > 0;
                            return (
                              <div
                                key={oIndex}
                                className="flex space-x-2 mb-2 items-center"
                              >
                                <div className="w-full min-w-[200px]">
                                  <input
                                    type="text"
                                    value={opt.value}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        qIndex,
                                        oIndex,
                                        e.target.value
                                      )
                                    }
                                    className={getInputClasses(optionValid)}
                                    placeholder={`Option ${oIndex + 1}`}
                                  />
                                </div>
                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    X
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 mt-2"
                          >
                            Add Another Option
                          </button>
                          {hasSubmitted &&
                            (q.options.length < 2 ||
                              q.options.some(
                                (o) => o.value.trim().length === 0
                              )) && (
                              <p className="text-red-500 text-sm mt-1">
                                Please provide at least two valid options.
                              </p>
                            )}
                        </div>

                        {/* Correct Answer */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correct Answer{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="w-full min-w-[200px]">
                            <select
                              value={q.answer}
                              onChange={(e) =>
                                handleQuestionChange(
                                  qIndex,
                                  "answer",
                                  e.target.value
                                )
                              }
                              className={getInputClasses(
                                q.answer.trim().length > 0
                              )}
                            >
                              <option value="">Select correct answer</option>
                              {q.options.map((opt, idx) =>
                                opt.value.trim() ? (
                                  <option key={idx} value={opt.value}>
                                    {opt.value}
                                  </option>
                                ) : null
                              )}
                            </select>
                          </div>
                          {hasSubmitted && q.answer.trim().length === 0 && (
                            <p className="text-red-500 text-sm mt-1">
                              Please select the correct answer.
                            </p>
                          )}
                        </div>
                      </div>

                      {hasSubmitted && !questionValid && (
                        <p className="text-red-500 text-sm mt-2">
                          Please complete this question before submitting.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add and Submit Buttons */}
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Add Question
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/quizzes/${id}`)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      isPending
                        ? "bg-indigo-400"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
