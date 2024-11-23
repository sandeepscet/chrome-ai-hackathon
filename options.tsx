import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPen, faTrashCan } from "@fortawesome/free-solid-svg-icons";

library.add(faPen,faTrashCan);

import './style.css';

type Prompt = {
  id: string,
  title: string;
  role: string;
  description: string;
  icon: string;
  website: string;
};

const Options = () => {
  const [settings, setSettings] = useState({
    aiMode: "offline",
    provider: 'gemini',
    token: "",
  });
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState<Prompt>({
    id: "",
    title: "",
    role: "",
    description: "",
    icon: "",
    website: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState("AI");

  const [errorMessage, setErrorMessage] = useState('');

  // Fetch stored AI settings and prompts from chrome.storage
  useEffect(() => {
    chrome.storage.local.get(["aiSettings", "prompts"], (result) => {
      const storedAISettings = result.aiSettings ||{ aiMode: "offline", token: "", provider: "" };
      setSettings(storedAISettings);

      const savedPrompts = result.prompts || [];
      setPrompts(savedPrompts);
    });
  }, []);

  // Save settings and prompts to chrome.storage
  useEffect(() => {
    chrome.storage.local.set({ aiSettings: settings });
  }, [settings]);

  useEffect(() => {
    chrome.storage.local.set({ prompts });
  }, [prompts]);

  // Handle AI Mode selection
const handleAIChange = (mode: string) => {
  setSettings((prevSettings) => {
    const updatedSettings = {
      ...prevSettings,
      aiMode: mode,
      token: "", // Clear the token when changing the mode
    };
    // Save the updated settings to chrome storage
    chrome.storage.local.set({ aiSettings: updatedSettings });
    return updatedSettings;
  });
};

const handleProviderChange = (provider: string) => {
  setSettings((prevSettings) => {
    const updatedSettings = {
      ...prevSettings,
      token: "",  // Optionally clear token when switching provider
    };
    updatedSettings.provider = provider;  // Set the selected provider
    chrome.storage.local.set({ aiSettings: updatedSettings });
    return updatedSettings;
  });
};



const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSettings((prevSettings) => {
    const updatedSettings = {
      ...prevSettings,
      token: e.target.value,
    };
    chrome.storage.local.set({ aiSettings: updatedSettings });
    return updatedSettings;
  });
};

const handleEdit = (id) => {
    const promptIndex = prompts.findIndex((prompt) => prompt.id === id);
    const promptToEdit = prompts[promptIndex];
    setNewPrompt(promptToEdit);
    setShowForm(true);  // Open the form to edit
  };

 const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      const promptIndex = prompts.findIndex((prompt) => prompt.id === id);
      if (promptIndex !== -1) {
        setPrompts((prevPrompts) => {
          const updatedPrompts = [...prevPrompts];
          updatedPrompts.splice(promptIndex, 1);
          return updatedPrompts;
        });
      }
    }
  };

  // Handle form changes for prompts
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPrompt({ ...newPrompt, [name]: value });
  };

  // Submit new prompt
  const handleSubmit = () => {
    if (!newPrompt.title || !newPrompt.description) {
      setErrorMessage('Title And Prompt is Mandatory');
      return false;
    }

    if (!newPrompt['id']) {
      newPrompt['id'] = self.crypto.randomUUID();
      setPrompts([...prompts, newPrompt]);
    } else {
    const promptIndex = prompts.findIndex((prompt) => prompt.id === newPrompt.id);
      if (promptIndex !== -1) {
        setPrompts((prevPrompts) => {
          const updatedPrompts = [...prevPrompts];
          updatedPrompts[promptIndex] = newPrompt;
          return updatedPrompts;
        });
  }    }

    setNewPrompt({ id:'', title: "", role: "", description: "", icon: "", website: "" });
    setErrorMessage('');
    setShowForm(false);
  };

  const handleCancel = () => {
    setNewPrompt({ id:"", title: "", role: "", description: "", icon: "", website: "" });
    setShowForm(false);
  };

  // Filter prompts based on search query
  const filteredPrompts = prompts
    .filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.website.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  // Pagination logic
  const paginatedPrompts = filteredPrompts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Options</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          className={`py-2 px-4 rounded ${activeTab === "AI" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("AI")}
        >
          AI
        </button>
        <button
          className={`py-2 px-4 rounded ${activeTab === "Prompts" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("Prompts")}
        >
          Prompts
        </button>
      </div>

      {/* AI Tab Content */}
      {activeTab === "AI" && (
        <div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Choose AI Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleAIChange("offline")}
                className={`w-1/2 py-2 px-4 rounded ${
                  settings.aiMode === "offline" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                Offline AI
              </button>
              <button
                onClick={() => handleAIChange("online")}
                className={`w-1/2 py-2 px-4 rounded ${
                  settings.aiMode === "online" ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
              >
                Online AI
              </button>
            </div>
          </div>

          {settings.aiMode === "online" && (
            <div className="mt-4">
              <label className="block text-gray-700 mb-2">Online AI Provider</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="provider"
                    value="gemini"
                    checked={settings.provider === "gemini"}
                    onChange={() => handleProviderChange("gemini")}
                  />
                  Gemini
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="provider"
                    value="openai"
                    checked={settings.provider === "openai"}
                    onChange={() => handleProviderChange("openai")}
                  />
                  OpenAI
                </label>
              </div>
              <input
                type="text"
                placeholder="Enter Token"
                className="w-full mt-2 p-2 border rounded"
                value={settings.token}
                onChange={handleTokenChange}
              />
              <div className="bg-yellow-400 text-black p-4 rounded-md mt-2">
                <strong>Warning!</strong> Demo feature showcasing the extensibility of the extension.
                Implemented Soon!!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prompts Tab Content */}
      {activeTab === "Prompts" && (
        <div>

          {errorMessage && (
            <div className="bg-red-200 text-red-800 p-2 rounded mb-2">
             { errorMessage }
            </div>
          )}

          <button
            onClick={() => setShowForm(true)}
            className="mb-4 w-50 bg-blue-500 text-white py-2 px-4 rounded"
          >
            Create New Prompt
          </button>

          {/* New Prompt Form */}
          {showForm && (
            <div className="p-4 border rounded mb-4">
              <h2 className="text-lg font-bold mb-4">New Prompt</h2>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={newPrompt.title}
                onChange={handleFormChange}
                required
                className="w-full mb-2 p-2 border rounded"
              />
              <input
                type="text"
                name="role"
                placeholder="Role Ex. Content writer"
                value={newPrompt.role}
                onChange={handleFormChange}
                className="w-full mb-2 p-2 border rounded"
              />
              <textarea
                name="description"
                placeholder="Prompt"
                value={newPrompt.description}
                onChange={handleFormChange}
                required
                className="w-full mb-2 p-2 border rounded"
              />
              <input
                type="url"
                name="website"
                placeholder="Website"
                value={newPrompt.website}
                onChange={handleFormChange}
                className="w-full mb-2 p-2 border rounded"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 text-white py-2 px-4 rounded w-1/2"
                >
                  Submit
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-500 text-white py-2 px-4 rounded w-1/2"
                >
                  Cancel
                </button>
               </div>
            </div>
          )}

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by title or website..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/2 mb-4 p-2 border rounded float-right	"
          />

          {/* Prompt Listing */}
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border p-2">Title</th>
                <th className="border p-2">Website</th>
                 <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPrompts.map((prompt, index) => (
                <tr key={index}>
                  <td className="border p-2">{prompt.title}</td>
                  <td className="border p-2">{prompt.website}</td>
                  <td className="border p-2">
                    <FontAwesomeIcon icon="pen"
                      className="h-5 w-5 text-blue-500 cursor-pointer mr-2"
                      onClick={() => handleEdit(prompt.id)}
                    />
                    <FontAwesomeIcon icon="trash-can"
                      className="h-5 w-5 text-red-500 cursor-pointer"
                      onClick={() => handleDelete(prompt.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(filteredPrompts.length / itemsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`py-1 px-3 rounded ${
                  currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Options;
