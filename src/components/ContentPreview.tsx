import { useState } from "react";
import {
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  BookmarkIcon,
} from "@heroicons/react/20/solid";
import CustomTextArea from "./CustomTextArea";

interface ContentPreviewProps {
  content: any[];
  type: "quiz" | "flashcard";
  onApprove: () => void;
  onReject: () => void;
  onEdit: (editedContent: any[]) => void;
  isSaving?: boolean;
}

const normalizeContent = (content: any) => {
  return content.map((item: any) => {
    if (item.options) {
      return {
        question: item.question,
        options: item.options,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
      };
    } else {
      return {
        question: item.font,
        answer: item.back,
        additionalNotes: item.additionalNotes,
      };
    }
  });
};

const validateContent = (content: any, type: "quiz" | "flashcard") => {
  const errors: string[] = [];

  if (type === "quiz") {
    content.forEach((item: any, index: number) => {
      if (!item.question) {
        errors.push(`Question ${index + 1} is missing a question.`);
      }
      if (!item.options || item.options.length < 2) {
        errors.push(`Question ${index + 1} must have at least 2 options.`);
      }
      if (!item.correctAnswer) {
        errors.push(`Question ${index + 1} is missing a correct answer.`);
      }
    });
  } else if (type === "flashcard") {
    content.forEach((item: any, index: number) => {
      if (!item.font) {
        errors.push(`Flashcard ${index + 1} is missing a question.`);
      }
      if (!item.back) {
        errors.push(`Flashcard ${index + 1} is missing an answer.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export function ContentPreview({
  content,
  type,
  onApprove,
  onReject,
  onEdit,
  isSaving,
}: ContentPreviewProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate content when component mounts or content changes
  const validateCurrentContent = () => {
    const result = validateContent(editMode ? editedContent : content, type);
    setValidationErrors(result.errors);
    return result.isValid;
  };

  const handleEdit = (index: number, field: string, value: any) => {
    const newContent = [...editedContent];
    newContent[index] = {
      ...newContent[index],
      [field]: value,
    };
    setEditedContent(newContent);
  };

  const handleSaveEdits = () => {
    const normalizedContent = normalizeContent(editedContent);
    const validationResult = validateContent(normalizedContent, type);

    if (validationResult.isValid) {
      onEdit(normalizedContent);
      setEditMode(false);
      setValidationErrors([]);
    } else {
      setValidationErrors(validationResult.errors);
    }
  };

  const renderQuizPreview = (item: any, index: number) => (
    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        {editMode ? (
          <>
            <textarea
              className="w-full p-2 border rounded"
              value={item.question}
              onChange={(e) => handleEdit(index, "question", e.target.value)}
            />
            <div className="space-y-2">
              {item.options.map((option: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...item.options];
                      newOptions[optIndex] = e.target.value;
                      handleEdit(index, "options", newOptions);
                    }}
                  />
                  <input
                    type="radio"
                    checked={option === item.correctAnswer}
                    onChange={() => handleEdit(index, "correctAnswer", option)}
                  />
                </div>
              ))}
            </div>
            <textarea
              className="w-full p-2 border rounded"
              value={item.explanation || ""}
              placeholder="Explanation (optional)"
              onChange={(e) => handleEdit(index, "explanation", e.target.value)}
            />
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium">Question {index + 1}</h3>
            <p className="text-gray-700">{item.question}</p>
            <div className="space-y-2">
              {item.options.map((option: string, optIndex: number) => (
                <div
                  key={optIndex}
                  className={`p-2 rounded ${
                    option === item.correctAnswer
                      ? "bg-green-100 border-green-500"
                      : "bg-gray-50"
                  }`}
                >
                  {option}
                  {option === item.correctAnswer && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </div>
              ))}
            </div>
            {item.explanation && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">{item.explanation}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderFlashcardPreview = (item: any, index: number) => (
    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        {editMode ? (
          <>
            <CustomTextArea
              label="Question"
              rows={3}
              value={item.front}
              onChange={(e) => handleEdit(index, "front", e)}
            />
            <CustomTextArea
              label="Answer"
              value={item.back}
              onChange={(e) => handleEdit(index, "back", e)}
              rows={5}
            />
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium">Flashcard {index + 1}</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <p className="font-medium">Question:</p>
                <p className="text-gray-700">{item.front}</p>
              </div>
              <div className="p-4">
                <p className="font-medium">Answer:</p>
                <p className="text-gray-700">{item.back}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-md sm:text-lg font-bold">
          Preview Generated {type === "quiz" ? "Quiz" : "Flashcards"}
        </h2>
        <div className="flex justify-center gap-1">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-2 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 sm:px-4 sm:py-2"
          >
            {editMode ? (
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          {editMode ? (
            <button
              onClick={handleSaveEdits}
              className="px-2 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700  sm:px-4 sm:py-2"
            >
              <BookmarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={onReject}
                className="px-2 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700  sm:px-4 sm:py-2"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (validateCurrentContent()) {
                    onApprove();
                  }
                }}
                disabled={isSaving}
                className="px-2 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700  sm:px-4 sm:py-2"
              >
                {isSaving ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                ) : (
                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">
            Validation Errors:
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {content.length > 0 && (
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              {currentIndex + 1} of {content.length}
            </span>
            <button
              onClick={() =>
                setCurrentIndex(Math.min(content.length - 1, currentIndex + 1))
              }
              disabled={currentIndex === content.length - 1}
              className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {content.length > 0 &&
          (type === "quiz"
            ? renderQuizPreview(
                editMode ? editedContent[currentIndex] : content[currentIndex],
                currentIndex
              )
            : renderFlashcardPreview(
                editMode ? editedContent[currentIndex] : content[currentIndex],
                currentIndex
              ))}
      </div>
    </div>
  );
}
