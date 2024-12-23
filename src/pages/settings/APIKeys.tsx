import React, { useState } from "react";
import { useAPIKeys } from "../../hooks/useAPIKeys";
import { CustomInput, CustomSelect } from "../../components/CustomTextArea";

const PROVIDERS = [
  { id: "openai", name: "OpenAI" },
  { id: "groq", name: "Groq" },
];

export default function APIKeys() {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [provider, setProvider] = useState(PROVIDERS[0].id);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const {
    apiKeys,
    isLoading,
    error,
    createAPIKey,
    updateAPIKey,
    deleteAPIKey,
  } = useAPIKeys();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKey) {
        await updateAPIKey.mutateAsync({
          id: editingKey,
          name,
          key,
        });
      } else {
        await createAPIKey.mutateAsync({
          name,
          key,
          provider,
        });
      }
      setName("");
      setKey("");
      setProvider(PROVIDERS[0].id);
      setEditingKey(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (apiKey: any) => {
    setEditingKey(apiKey.id);
    setName(apiKey.name);
    setProvider(apiKey.provider);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setName("");
    setKey("");
    setProvider(PROVIDERS[0].id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this API key?")) {
      await deleteAPIKey.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading API keys</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your API keys for different providers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <CustomInput
            label="Name"
            value={name}
            onChange={(v) => setName(v)}
            required
          />
        </div>

        <div>
          <CustomInput
            label="API Key"
            value={key}
            onChange={(v) => setKey(v)}
            required={!editingKey}
          />

          {editingKey && (
            <p className="mt-1 text-sm text-gray-500">
              Leave blank to keep the current key
            </p>
          )}
        </div>

        {!editingKey && (
          <div>
            <CustomSelect
              label="Provider"
              value={provider}
              onChange={(v) => setProvider(v as string)}
              options={PROVIDERS.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3">
          {editingKey && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            {editingKey ? "Update" : "Add"} API Key
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Your API Keys</h3>
        <div className="mt-4 space-y-4">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="flex items-center justify-between p-4 bg-white border rounded-lg"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {apiKey.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {PROVIDERS.find((p) => p.id === apiKey.provider)?.name}
                </p>
                <code></code>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleEdit(apiKey)}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(apiKey.id)}
                  className="text-sm text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
