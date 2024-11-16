const prompts = {
    1: {
        prompt: 'Help me to rewrite',
        role: "content writer"
    },
    2: {
        prompt: 'Help me to summarize',
        role: "content writer"
    }
};

export async function generateText(promptId, text) {
    const capabilities = await ai.languageModel.capabilities();

    if (!capabilities.available) {
        return 'AI Model not available';
    }

    const prompt = prompts[promptId];
    const session = await ai.languageModel.create({
        systemPrompt: "Pretend to be a role of ." + prompt.role
    });

    const promptText = `${prompt.prompt} to input ${text}. Make sure to reply with just output text without any context or output information`

    return await session.promptStreaming(promptText);
}
