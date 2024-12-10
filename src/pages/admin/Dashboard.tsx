import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "../../config";
import { useAdmin } from "../../context/AdminContext";

interface Analytics {
  totalUsers: number;
  totalLectures: number;
  totalQuizzes: number;
  totalFlashcards: number;
  totalQuizAttempts: number;
  totalFlashcardReviews: number;
  activeUsersLast30Days: number;
}

export default function AdminDashboard() {
  const { adminToken } = useAdmin();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const response = await axios.get<Analytics>(
        `${API_URL}/admin/analytics`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Users"
            value={analytics?.totalUsers || 0}
            description="Registered users"
          />
          <StatCard
            title="Active Users"
            value={analytics?.activeUsersLast30Days || 0}
            description="Active in last 30 days"
          />
          <StatCard
            title="Total Lectures"
            value={analytics?.totalLectures || 0}
            description="Created lectures"
          />
          <StatCard
            title="Total Quizzes"
            value={analytics?.totalQuizzes || 0}
            description="Generated quizzes"
          />
          <StatCard
            title="Total Flashcards"
            value={analytics?.totalFlashcards || 0}
            description="Generated flashcards"
          />
          <StatCard
            title="Learning Activities"
            value={
              (analytics?.totalQuizAttempts || 0) +
              (analytics?.totalFlashcardReviews || 0)
            }
            description="Quiz attempts & flashcard reviews"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {value.toLocaleString()}
            </dd>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-500">{description}</div>
        </div>
      </div>
    </div>
  );
}
