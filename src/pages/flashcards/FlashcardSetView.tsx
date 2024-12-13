import React, { useEffect, useState } from "react";
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
import ReactMarkdown from "react-markdown";

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

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

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
    onSuccess: () => {
      console.log("Review submitted successfully");
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
    flashcardSet.flashcards[currentCardIndex].flashcardReview = [
      { confidence },
    ];

    setCurrentCardIndex((index) =>
      Math.min(index + 1, flashcardSet.flashcards.length - 1)
    );

    submitReview.mutate({
      flashcardId: flashcardSet.flashcards[currentCardIndex].id,
      confidence,
    });
  };

  const downloadFlashcards = async () => {
    try {
      // Prepare the request body

      setDownloading(true);

      const body = {
        flashcards: flashcardSet.flashcards.map((card) => ({
          front: card.front,
          back: card.back,
        })),
      };

      // Fetch the PPTX file from the API
      const response = await fetch("http://54.237.184.84:8000/generate-pptx/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error fetching PPTX: ${response.statusText}`);
      }

      // Convert response to blob
      const pptxBlob = await response.blob();

      // Create a download link for the PPTX file
      const element = document.createElement("a");
      const url = URL.createObjectURL(pptxBlob);
      element.href = url;
      element.download = `${flashcardSet.title}.pptx`; // Name of the downloaded file
      document.body.appendChild(element);
      element.click();

      // Clean up
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PPTX:", error);
    } finally {
      setDownloading(false);
    }
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
            {/* download flashcards */}
            <button
              onClick={downloadFlashcards}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              disabled={downloading}
            >
              {
                // Add a spinner when downloading
                downloading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg
                      width="20px"
                      height="20px"
                      viewBox="0 0 400 400"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        <defs>
                          <style>{/* .cls-1{fill:#fd7a00;} */}</style>
                        </defs>
                        <title></title>
                        <g id="xxx-word">
                          <path
                            className="cls-1"
                            d="M325,105H250a5,5,0,0,1-5-5V25a5,5,0,1,1,10,0V95h70a5,5,0,0,1,0,10Z"
                          ></path>
                          <path
                            className="cls-1"
                            d="M325,154.83a5,5,0,0,1-5-5V102.07L247.93,30H100A20,20,0,0,0,80,50v98.17a5,5,0,0,1-10,0V50a30,30,0,0,1,30-30H250a5,5,0,0,1,3.54,1.46l75,75A5,5,0,0,1,330,100v49.83A5,5,0,0,1,325,154.83Z"
                          ></path>
                          <path
                            className="cls-1"
                            d="M300,380H100a30,30,0,0,1-30-30V275a5,5,0,0,1,10,0v75a20,20,0,0,0,20,20H300a20,20,0,0,0,20-20V275a5,5,0,0,1,10,0v75A30,30,0,0,1,300,380Z"
                          ></path>
                          <path
                            className="cls-1"
                            d="M275,280H125a5,5,0,1,1,0-10H275a5,5,0,0,1,0,10Z"
                          ></path>
                          <path
                            className="cls-1"
                            d="M200,330H125a5,5,0,1,1,0-10h75a5,5,0,0,1,0,10Z"
                          ></path>
                          <path
                            className="cls-1"
                            d="M325,280H75a30,30,0,0,1-30-30V173.17a30,30,0,0,1,30-30h.2l250,1.66a30.09,30.09,0,0,1,29.81,30V250A30,30,0,0,1,325,280ZM75,153.17a20,20,0,0,0-20,20V250a20,20,0,0,0,20,20H325a20,20,0,0,0,20-20V174.83a20.06,20.06,0,0,0-19.88-20l-250-1.66Z"
                          ></path>
                          <path
                            className="cls-1"
                            d="M157.07,236h-9.61V182.68H169.3q9.34,0,13.85,4.71a16.37,16.37,0,0,1-.37,22.95,17.49,17.49,0,0,1-12.38,4.53H157.07Zm0-29.37h11.37q4.45,0,6.8-2.19a7.58,7.58,0,0,0,2.34-5.82,8,8,0,0,0-2.17-5.62q-2.17-2.34-7.83-2.34H157.07Z"
                          ></path>
                          <path
                            className="cls-1"
                            d="M203.95,249.32h-9.06V196.55h8.52v6.88q4.1-7.69,12.07-7.7a12.1,12.1,0,0,1,10.47,5.7q3.91,5.7,3.91,14.57a27.84,27.84,0,0,1-3.73,14.61A12.15,12.15,0,0,1,215,236.82q-7.62,0-11.05-6.33Zm0-29.49A10.23,10.23,0,0,0,206.5,227a7.55,7.55,0,0,0,5.68,2.83,6.57,6.57,0,0,0,6.23-3.73,20.16,20.16,0,0,0,2-9.47,20.91,20.91,0,0,0-2-9.79,6.37,6.37,0,0,0-5.94-3.77,7.5,7.5,0,0,0-6,3.09,12.51,12.51,0,0,0-2.48,8.09Z"
                          ></path>
                          <path
                            className="cls-1"
                            d="M256.25,229v7a31.56,31.56,0,0,1-6.17.86,12.57,12.57,0,0,1-6.17-1.43,8.72,8.72,0,0,1-3.77-3.91q-1.19-2.48-1.19-7.64V203.46H234v-6.91h5.43l.82-10.27,7.3-.66v10.94h7.93v6.91h-7.93v19.26q0,3.71,1.35,5.06t5.1,1.35Q255.08,229.13,256.25,229Z"
                          ></path>
                        </g>
                      </g>
                    </svg>
                    <span
                      className="hidden sm:inline"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Download
                    </span>
                  </>
                )
              }
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
              <ReactMarkdown>{currentCard.back}</ReactMarkdown>
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
        {flashcardSet.flashcards.map((card, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentCardIndex(index);
              setIsFlipped(false);
            }}
            className={`h-2 rounded-full ${
              currentCardIndex === index
                ? "bg-indigo-300 shadow-md"
                : card.flashcardReview.length > 0
                ? card.flashcardReview[0].confidence === 5
                  ? "bg-emerald-400"
                  : card.flashcardReview[0].confidence === 4
                  ? "bg-green-400"
                  : card.flashcardReview[0].confidence === 3
                  ? "bg-yellow-400"
                  : card.flashcardReview[0].confidence === 2
                  ? "bg-orange-400"
                  : "bg-red-400"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
