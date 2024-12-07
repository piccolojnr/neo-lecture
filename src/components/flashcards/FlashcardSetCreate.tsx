import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFlashcards } from "../../hooks/useFlashcards";
import CustomTextArea from "../CustomTextArea";
import Breadcrumb from "../common/Breadcrumb";

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardSetCreate() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const { createFlashcardSet } = useFlashcards();

  const [title, setTitle] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { front: "", back: "" },
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleAddCard = () => {
    setFlashcards([...flashcards, { front: "", back: "" }]);
  };

  const handleRemoveCard = (index: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const handleCardChange = (
    index: number,
    field: "front" | "back",
    value: string
  ) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index] = { ...newFlashcards[index], [field]: value };
    setFlashcards(newFlashcards);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (flashcards.some((card) => !card.front.trim() || !card.back.trim())) {
      setError("All flashcards must have both front and back content");
      return;
    }

    try {
      await createFlashcardSet.mutateAsync({
        title,
        lectureId: lectureId!,
        flashcards,
      });
      navigate(`/lectures/${lectureId}`);
    } catch (error) {
      setError("Failed to create flashcard set");
      console.error("Create flashcard set error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          {
            name: "Lectures",
            href: "/lectures",
          },
          {
            name: "Lecture",
            href: `/lectures/${lectureId}`,
          },
          {
            name: "Create Flashcard Set",
            href: `/lectures/${lectureId}/flashcards/create`,
          },
        ]}
      />
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
          Create Flashcard Set
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Section */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              placeholder="Enter flashcard set title"
            />
          </div>

          {/* Flashcards Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Flashcards
              </h2>
              <button
                type="button"
                onClick={handleAddCard}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Card
              </button>
            </div>

            {flashcards.map((card, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-lg shadow-inner"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-800">
                    Card {index + 1}
                  </h3>
                  {flashcards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCard(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomTextArea
                    label="Front"
                    value={card.front}
                    onChange={(value) =>
                      handleCardChange(index, "front", value)
                    }
                    rows={3}
                  />

                  <CustomTextArea
                    label="Back"
                    value={card.back}
                    onChange={(value) => handleCardChange(index, "back", value)}
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/lectures/${lectureId}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={createFlashcardSet.isPending}
            >
              {createFlashcardSet.isPending ? "Creating..." : "Create Set"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
