import React, { useState, useEffect } from "react";

type Prompt = {
  title: string;
  role: string;
  description: string;
  icon: string;
  website: string;
};

const Options = () => {
  const [settings, setSettings] = useState({
    aiMode: "offline",
    token: "",
  });

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState<Prompt>({
    title: "",
    role: "",
    description: "",
    icon: "",
    website: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    chrome.storage.local.get(["prompts"], (result) => {
        const savedPrompts = result.prompts || [];
        console.log("Loaded prompts:", savedPrompts);
        setPrompts(savedPrompts);
    });
    }, []);

    useEffect(() => {
    chrome.storage.local.set({ prompts }, () => {
        console.log("Prompts updated in storage:", prompts);
    });
    }, [prompts]);


  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPrompt({ ...newPrompt, [name]: value });
  };

  // Submit new prompt
  const handleSubmit = () => {
    setPrompts([...prompts, newPrompt]);
    setNewPrompt({ title: "", role: "", description: "", icon: "", website: "" });
    setShowForm(false);
  };

  // Filtered and sorted prompts
  const filteredPrompts = prompts
    .filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.website.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  // Pagination
  const paginatedPrompts = filteredPrompts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Extension Options</h1>

      {/* AI Mode Selection */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">AI Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setSettings({ ...settings, aiMode: "offline" })}
            className={`w-1/2 py-2 px-4 rounded ${
              settings.aiMode === "offline" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Offline AI
          </button>
          <button
            onClick={() => setSettings({ ...settings, aiMode: "online" })}
            className={`w-1/2 py-2 px-4 rounded ${
              settings.aiMode === "online" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            Online AI
          </button>
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
                  onChange={() => setSettings({ ...settings, token: "" })}
                />
                Gemini
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="provider"
                  value="pe"
                  onChange={() => setSettings({ ...settings, token: "" })}
                />
                Pe
              </label>
            </div>
            <input
              type="text"
              placeholder="Enter Token"
              className="w-full mt-2 p-2 border rounded"
              value={settings.token}
              onChange={(e) => setSettings({ ...settings, token: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Create New Prompt Button */}
      <button
        onClick={() => setShowForm(true)}
        className="mb-4 w-full bg-blue-500 text-white py-2 px-4 rounded"
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
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={newPrompt.role}
            onChange={handleFormChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newPrompt.description}
            onChange={handleFormChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="icon"
            placeholder="Icon URL"
            value={newPrompt.icon}
            onChange={handleFormChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="website"
            placeholder="Website"
            value={newPrompt.website}
            onChange={handleFormChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white py-2 px-4 rounded w-full"
          >
            Submit
          </button>
        </div>
      )}

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by title or website..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      {/* Prompt Listing */}
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Website</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPrompts.map((prompt, index) => (
            <tr key={index}>
              <td className="border p-2">{prompt.title}</td>
              <td className="border p-2">{prompt.website}</td>
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
  );
};

export default Options;
