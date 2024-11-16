export async  function fetchPromptsForCurrentWebsite (callback) {
  const currentHostname = window.location.hostname;

  chrome.storage.local.get(["prompts"], (result) => {
    const storedPrompts = result.prompts || [];

    // Filter prompts by current hostname
    const filteredPrompts = storedPrompts.filter((prompt: { website: string }) =>
      prompt.website.includes(currentHostname)
    );

    console.log("Prompts for current website:", filteredPrompts);
    callback(filteredPrompts); // Use the callback to return data
  });
};


export async function generateText(promptId, text , prompts) {
    const capabilities = await ai.languageModel.capabilities();

    if (!capabilities.available) {
        return 'AI Model not available';
    }

    const prompt = prompts[promptId];
    const promptText = `${prompt.desription} to input ${text}. Make sure to reply with just output text without any context or output information`
    console.log({prompt, promptText})


    const session = await ai.languageModel.create({
        systemPrompt: "Pretend to be a role of ." + prompt.role ?? 'good writer'
    });

     return await session.promptStreaming(promptText);
}
