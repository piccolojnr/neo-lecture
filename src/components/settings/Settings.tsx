import React, { useState } from "react";
import APIKeys from "./APIKeys";

const TABS = [
  { id: "api-keys", name: "API Keys" },
  // Add more tabs as needed
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                                        w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm
                                        ${
                                          activeTab === tab.id
                                            ? "border-indigo-500 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }
                                    `}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "api-keys" && <APIKeys />}
            {/* Add more tab content as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
