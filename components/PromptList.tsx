import React from "react"

const PromptList = ({ prompts }: { prompts: any[] }) => {
  return (
    <div className="mt-4">
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className="bg-gray-100 p-4 mb-4 rounded shadow"
        >
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">{prompt.title}</h2>
            <button className="bg-yellow-400 text-white px-4 py-2 rounded">
              Edit
            </button>
          </div>
          <p className="text-sm text-gray-600 truncate">{prompt.description}</p>
        </div>
      ))}
    </div>
  )
}

export { PromptList }
