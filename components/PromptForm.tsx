import React, { useState } from "react"

const PromptForm = ({
  currentHost,
  onClose,
  onAddPrompt,
}: {
  currentHost: string
  onClose: () => void
  onAddPrompt: (prompt: any) => void
}) => {
  const [title, setTitle] = useState("")
  const [role, setRole] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("")
  const [website, setWebsite] = useState(currentHost)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPrompt = {
      id: Date.now().toString(),
      title,
      role,
      description,
      icon,
      website,
    }

    // Call the parent function to add the prompt
    onAddPrompt(newPrompt)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-lg font-semibold">Create a New Prompt</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 w-full"
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Icon</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="border p-2 w-full"
              readOnly
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export { PromptForm }
