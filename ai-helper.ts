export async  function fetchPromptsForCurrentWebsite (callback) {
  const currentHostname = window.location.hostname;

  chrome.storage.local.get(["prompts"], (result) => {
    const storedPrompts = result.prompts || [];

    // Filter prompts by current hostname
    const filteredPrompts = storedPrompts.filter((prompt: { website: string }) =>
      prompt.website.includes(currentHostname) || prompt.website === ''
    );

    console.log("Prompts for current website:", filteredPrompts);
    callback(filteredPrompts); // Use the callback to return data
  });
};


export async function generateText(promptId, text , prompts) {
    const capabilities = await ai.languageModel.capabilities();

    if (!capabilities.available) {
        return await 'AI Model not available';
    }

    const prompt = prompts[promptId];

    if (prompt) {
      const promptText = `${prompt.description} to given input Input: ${text}. Make sure to reply with just output text without any context or output information. it should be directly usable without surrounding quotes`
      console.log({prompt, promptText})

      try {
          const session = await ai.languageModel.create({
          systemPrompt: "Pretend to be a role of ." + prompt.role ?? 'good writer'
        });

         return await session.promptStreaming(promptText);
      } catch (error) {
        console.log(error);
        return await "Error in AI model response.";
      }
    }

    return await "Error in extention. please email us.";
}


async function simulatePromptStreaming(promptText) {
    const fullResponse = `This is the response to the prompt: ${promptText}. It will be streamed in parts.`;
    let index = 0;
    const chunkSize = 10; // Size of each chunk to simulate the stream
    const delay = 500; // Delay in ms between each chunk

    // Function to simulate the streaming process
    return new Promise((resolve) => {
        let result = '';

        const intervalId = setInterval(() => {
            // Get a chunk of the response
            const chunk = fullResponse.slice(index, index + chunkSize);

            // Append the chunk to the result
            result += chunk;

            // Update the index
            index += chunkSize;

            // When the response is fully simulated, resolve the promise
            if (index >= fullResponse.length) {
                clearInterval(intervalId);
                resolve(result); // Return the full streamed response
            }
        }, delay); // Time interval between each chunk
    });
}
