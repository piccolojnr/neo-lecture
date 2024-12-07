import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFlashcards } from "../../hooks/useFlashcards";
import Breadcrumb from "../common/Breadcrumb";
import axios from "axios";
import { API_URL } from "../../config";
import { useMutation } from "@tanstack/react-query";

interface ConfidenceButton {
  level: number;
  label: string;
  color: string;
  hoverColor: string;
}

const confidenceButtons: ConfidenceButton[] = [
  {
    level: 1,
    label: "Again",
    color: "bg-red-600",
    hoverColor: "hover:bg-red-700",
  },
  {
    level: 2,
    label: "Hard",
    color: "bg-orange-600",
    hoverColor: "hover:bg-orange-700",
  },
  {
    level: 3,
    label: "Good",
    color: "bg-yellow-600",
    hoverColor: "hover:bg-yellow-700",
  },
  {
    level: 4,
    label: "Easy",
    color: "bg-green-600",
    hoverColor: "hover:bg-green-700",
  },
  {
    level: 5,
    label: "Perfect",
    color: "bg-emerald-600",
    hoverColor: "hover:bg-emerald-700",
  },
];

export default function FlashcardSetView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFlashcardSet, deleteFlashcardSet } = useFlashcards();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);

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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      handleNext();
      setShowConfidence(false);
    },
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error loading flashcard set</p>
        </div>
      </div>
    );
  }

  if (!flashcardSet) {
    return null;
  }

  const handleNext = () => {
    if (currentCardIndex < flashcardSet.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowConfidence(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      setShowConfidence(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFlashcardSet.mutateAsync(id!);
      navigate(`/lectures/${flashcardSet.lectureId}`);
    } catch (error) {
      console.error("Delete flashcard set error:", error);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setShowConfidence(true);
    }
  };

  const handleConfidenceRating = (confidence: number) => {
    submitReview.mutate({
      flashcardId: flashcardSet.flashcards[currentCardIndex].id,
      confidence,
    });
  };

  const currentCard = flashcardSet.flashcards[currentCardIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {flashcardSet && (
        <>
          <Breadcrumb
            items={[
              {
                name: "Dashboard",
                href: "/dashboard",
              },
              {
                name: flashcardSet.lecture.title,
                href: `/lectures/${flashcardSet.lecture.id}`,
              },
              {
                name: flashcardSet.title,
                href: `/flashcards/${flashcardSet.id}`,
              },
            ]}
          />
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {flashcardSet.title}
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate(`/flashcards/${id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Card {currentCardIndex + 1} of {flashcardSet.flashcards.length}
              </p>
            </div>

            <div
              className="relative h-64 mb-6 cursor-pointer"
              onClick={handleFlip}
            >
              <div
                className={`absolute inset-0 transition-transform duration-500 transform ${
                  isFlipped ? "rotate-y-180 opacity-0" : ""
                }`}
              >
                <div className="h-full bg-gray-50 rounded-lg p-6 flex items-center justify-center">
                  <p className="text-lg text-center">{currentCard.front}</p>
                </div>
              </div>
              <div
                className={`absolute inset-0 transition-transform duration-500 transform ${
                  isFlipped ? "" : "rotate-y-180 opacity-0"
                }`}
              >
                <div className="h-full bg-gray-50 rounded-lg p-6 flex items-center justify-center">
                  <p className="text-lg text-center">{currentCard.back}</p>
                </div>
              </div>
            </div>

            {showConfidence && isFlipped ? (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  How well did you know this?
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {confidenceButtons.map((button) => (
                    <button
                      key={button.level}
                      onClick={() => handleConfidenceRating(button.level)}
                      className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                        button.color
                      } ${button.hoverColor} ${
                        submitReview.isPending
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={submitReview.isPending}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentCardIndex === 0}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    currentCardIndex === flashcardSet.flashcards.length - 1
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Delete Flashcard Set
                </h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete this flashcard set? This
                  action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
