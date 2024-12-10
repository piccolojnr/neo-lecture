import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "../../config";
import { useAdmin } from "../../context/AdminContext";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  _count: {
    lectures: number;
    quizAttempts: number;
    flashcardReviews: number;
  };
  lectures: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
  apiKeys: Array<{
    id: string;
    name: string;
    provider: string;
    createdAt: string;
  }>;
}

export default function AdminUsers() {
  const { adminToken } = useAdmin();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await axios.get<User[]>(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      return response.data;
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSelectedUser(null);
    },
  });

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      await deleteUser.mutateAsync(userId);
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      <div className="flex space-x-6">
        {/* Users List */}
        <div className="flex-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users?.map((user) => (
                <li key={user.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {user.name || "Unnamed User"}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {user._count.lectures} lectures
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* User Details */}
        {selectedUser && (
          <div className="w-96">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Details
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedUser.name || "Not set"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedUser.email || "Not set"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Activity Summary
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <span>Lectures</span>
                          <span className="font-medium">
                            {selectedUser._count.lectures}
                          </span>
                        </li>
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <span>Quiz Attempts</span>
                          <span className="font-medium">
                            {selectedUser._count.quizAttempts}
                          </span>
                        </li>
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <span>Flashcard Reviews</span>
                          <span className="font-medium">
                            {selectedUser._count.flashcardReviews}
                          </span>
                        </li>
                      </ul>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      API Keys
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {selectedUser.apiKeys.map((key) => (
                          <li
                            key={key.id}
                            className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                          >
                            <span>{key.name}</span>
                            <span className="text-gray-500">
                              {key.provider}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
