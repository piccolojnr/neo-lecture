import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFlashcards } from "../../hooks/useFlashcards";
import Breadcrumb from "../common/Breadcrumb";
import axios from "axios";
import { API_URL } from "../../config";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface ConfidenceButton {
  level: number;
  label: string;
  color: string;
}

const confidenceButtons: ConfidenceButton[] = [
  { level: 1, label: "Again", color: "bg-red-600" },
  { level: 2, label: "Hard", color: "bg-orange-600" },
  { level: 3, label: "Good", color: "bg-yellow-600" },
  { level: 4, label: "Easy", color: "bg-green-600" },
  { level: 5, label: "Perfect", color: "bg-emerald-600" },
];

export default function FlashcardSetView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFlashcardSet, deleteFlashcardSet } = useFlashcards();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: flashcardSet, isLoading, error } = getFlashcardSet(id!);

  const submitReview = useMutation({
    mutationFn: async ({
      flashcardId,
      confidence,
    }: {
      flashcardId: string;
      confidence: number;
    }) => {
      const response = await axios.post(
        `${API_URL}/users/flashcard/${flashcardId}/review`,
        { confidence },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    },
    onSuccess: () =>
      setCurrentCardIndex((index) =>
        Math.min(index + 1, flashcardSet!.flashcards.length - 1)
      ),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 p-6 rounded-lg shadow-md">
          <XCircleIcon className="w-6 h-6 text-red-500 mb-2" />
          <p className="text-red-600">
            Error loading flashcard set. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!flashcardSet) return null;

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const handleDelete = async () => {
    try {
      await deleteFlashcardSet.mutateAsync(id!);
      navigate(`/lectures/${flashcardSet.lectureId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfidenceRating = (confidence: number) => {
    submitReview.mutate({
      flashcardId: flashcardSet.flashcards[currentCardIndex].id,
      confidence,
    });

    setIsFlipped(false);
  };

  const currentCard = flashcardSet.flashcards[currentCardIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Breadcrumb
        items={[
          { name: "Dashboard", href: "/dashboard" },
          {
            name: flashcardSet.lecture.title,
            href: `/lectures/${flashcardSet.lecture.id}`,
          },
          { name: flashcardSet.title, href: `/flashcards/${flashcardSet.id}` },
        ]}
      />
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="flex justify-between items-center ">
          <h1 className="text-xl font-bold text-gray-800">
            {flashcardSet.title}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/flashcards/${id}/edit`)}
              className="flex items-center space-x-1 px-3 py-1 border rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <PencilIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <TrashIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
        <div
          className="relative h-64 sm:h-80 md:h-96 rounded-lg shadow-md bg-gray-50 flex justify-center items-center cursor-pointer"
          onClick={handleFlip}
        >
          <div
            className={`absolute inset-0 flex items-center justify-center p-4 text-lg sm:text-xl md:text-2xl overflow-scroll ${
              isFlipped ? "hidden" : ""
            }`}
          >
            <p className="text-center overflow-scroll text-ellipsis max-h-full leading-tight no-scrollbar ">
              {currentCard.front}
            </p>
          </div>
          <div
            className={`absolute inset-0 flex items-center justify-center p-4 text-lg sm:text-xl md:text-2xl overflow-scroll ${
              !isFlipped ? "hidden" : ""
            }`}
          >
            <p className="text-center overflow-scroll text-ellipsis max-h-full leading-tight no-scrollbar ">
              {currentCard.back}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() =>
              setCurrentCardIndex((index) => Math.max(index - 1, 0))
            }
            disabled={currentCardIndex === 0}
            className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <p className="text-gray-600 text-sm sm:text-base">
            Card {currentCardIndex + 1} of {flashcardSet.flashcards.length}
          </p>
          <button
            onClick={() =>
              setCurrentCardIndex((index) =>
                Math.min(index + 1, flashcardSet.flashcards.length - 1)
              )
            }
            disabled={currentCardIndex === flashcardSet.flashcards.length - 1}
            className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
        {isFlipped && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              How well did you know this card?
            </p>
            <div className="grid grid-cols-5 gap-3">
              {confidenceButtons.map((button) => (
                <button
                  key={button.level}
                  onClick={() => handleConfidenceRating(button.level)}
                  className="flex flex-col items-center justify-center p-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow transition-transform transform hover:scale-105"
                >
                  {/* Add icons to improve button aesthetics */}
                  <span className="text-sm">
                    {button.level === 1 && "🔄"} {/* Example: Retry */}
                    {button.level === 2 && "💪"} {/* Example: Hard */}
                    {button.level === 3 && "👍"} {/* Example: Good */}
                    {button.level === 4 && "👌"} {/* Example: Easy */}
                    {button.level === 5 && "🌟"} {/* Example: Perfect */}
                  </span>
                  <span className="text-xs font-medium">{button.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Delete Flashcard Set
            </h2>
            <p className="text-gray-600">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-6 gap-2 mt-4">
        {flashcardSet.flashcards.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentCardIndex(index);
              setIsFlipped(false);
            }}
            className={`h-2 rounded-full ${
              currentCardIndex === index ? "bg-indigo-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
