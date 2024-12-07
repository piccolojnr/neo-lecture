import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFlashcards } from "../../hooks/useFlashcards";
import { CustomInput, CustomTextArea } from "../CustomTextArea";
import Breadcrumb from "../common/Breadcrumb";

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardSetEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFlashcardSet, updateFlashcardSet } = useFlashcards();

  const [title, setTitle] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: flashcardSet, isLoading } = getFlashcardSet(id!);

  useEffect(() => {
    if (flashcardSet) {
      setTitle(flashcardSet.title);
      setFlashcards(
        flashcardSet.flashcards.map((card) => ({
          front: card.front,
          back: card.back,
        }))
      );
    }
  }, [flashcardSet]);

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
      await updateFlashcardSet.mutateAsync({
        id: id!,
        title,
        flashcards,
      });
      navigate(`/flashcards/${id}`);
    } catch (error) {
      setError("Failed to update flashcard set");
      console.error("Update flashcard set error:", error);
    }
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
      {flashcardSet && (
        <>
          <Breadcrumb
            items={[
              {
                name: "Dashboard",
                href: "/dashbord",
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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Flashcard Set
            </h1>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <CustomInput
                  label="Title"
                  value={title}
                  onChange={(v) => setTitle(v)}
                  required
                />
              </div>

              <div className="space-y-6">
                {flashcards.map((card, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Card {index + 1}</h3>
                      {flashcards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        onChange={(value) =>
                          handleCardChange(index, "back", value)
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={handleAddCard}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Add Card
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/flashcards/${id}`)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    disabled={updateFlashcardSet.isPending}
                  >
                    {updateFlashcardSet.isPending
                      ? "Saving..."
                      : "Save Changes"}
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
