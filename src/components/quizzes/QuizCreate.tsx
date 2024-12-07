import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuizzes } from "../../hooks/useQuizzes";
import Breadcrumb from "../common/Breadcrumb";

interface Option {
  value: string;
}

interface Question {
  question: string;
  options: Option[];
  answer: string;
}

export default function QuizCreate() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const { createQuiz } = useQuizzes();

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: [{ value: "" }, { value: "" }], answer: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isPending = createQuiz.isPending;

  // Validation functions
  const validateTitle = () => title.trim().length > 0;
  const validateQuestion = (q: Question) =>
    q.question.trim().length > 0 &&
    q.options.every((opt) => opt.value.trim().length > 0) &&
    q.answer.trim().length > 0;

  const isFormValid = () => {
    if (!validateTitle()) return false;
    return questions.every(validateQuestion);
  };

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
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
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
      setError("Please fill in all required fields before creating the quiz.");
      return;
    }

    // Construct payload with comma-separated options
    const quizPayload = {
      title: title.trim(),
      lectureId: lectureId!,
      questions: questions.map((q) => ({
        question: q.question.trim(),
        options: q.options,
        answer: q.answer.trim(),
      })),
    };

    try {
      await createQuiz.mutateAsync(quizPayload);
      navigate(`/lectures/${lectureId}`);
    } catch (error) {
      setError("Failed to create quiz. Please try again.");
      console.error("Create quiz error:", error);
    }
  };

  // Helper to determine border color based on validation
  const getInputClasses = (isValid: boolean) => {
    const baseClasses =
      "w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow";
    const borderClass =
      !hasSubmitted || isValid ? "border-slate-200" : "border-red-500";
    return `${baseClasses} ${borderClass}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          {
            name: "Dashboard",
            href: "/dashbord",
          },
          {
            name: "Lecture",
            href: `/lectures/${lectureId}`,
          },
          {
            name: "Create Quiz",
            href: `/lectures/${lectureId}/quizzes/create`,
          },
        ]}
      />
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 border-b pb-4 mb-6">
          Create Quiz
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Section */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <div className="w-full min-w-[200px]">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={getInputClasses(validateTitle())}
                placeholder="Enter a descriptive title for your quiz"
              />
            </div>
            {hasSubmitted && !validateTitle() && (
              <p className="text-red-500 text-sm mt-1">Title is required.</p>
            )}
          </div>

          {/* Questions Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Question
              </button>
            </div>

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
                        Add at least two options. Mark the correct one below.
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
                        Correct Answer <span className="text-red-500">*</span>
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

          {/* Action Buttons */}
          <div className="pt-6 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/lectures/${lectureId}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isPending
                  ? "bg-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
