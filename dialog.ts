import { generateText } from "~ai-helper"
import cssText from "data-text:./dialog.css"

const style = document.createElement("style")
style.textContent = cssText
document.head.appendChild(style)

class CustomDialog {
    private dialog: HTMLDialogElement;
    private promptInput: HTMLTextAreaElement;
    private contentInput: HTMLTextAreaElement;
    private submitButton: HTMLButtonElement;
    private insertButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private selectedText: '';
    private callback: (values: {prompt: string, content: string}) => void;

    constructor() {
        this.createDialog();
        this.setupEventListeners();
    }



    private createDialog() {
        // Create container for scoped styles
        const container = document.createElement('div');
        container.id = 'plasmo-dialog-container';

        // Create dialog element
        this.dialog = document.createElement('dialog');

        // Create header
        const header = document.createElement('div');
        header.className = 'dialog-header';
        const title = document.createElement('h2');
        title.className = 'dialog-title';
        title.textContent = 'Generate Content';
        header.appendChild(title);

        // Create form elements
        const form = document.createElement('form');
        form.method = 'dialog';
        form.className = 'dialog-form';

        // Prompt input group
        const promptGroup = document.createElement('div');
        promptGroup.className = 'input-group';
        const promptLabel = document.createElement('label');
        promptLabel.textContent = 'Prompt';
        promptLabel.htmlFor = 'prompt-input';
        this.promptInput = document.createElement('textarea');
        this.promptInput.id = 'prompt-input';
        this.promptInput.classList.add('no-chromatic')
        this.promptInput.placeholder = 'Enter your prompt...';
        promptGroup.append(promptLabel, this.promptInput);

        // Content input group
        const contentGroup = document.createElement('div');
        contentGroup.className = 'input-group';
        const contentLabel = document.createElement('label');
        contentLabel.textContent = 'Content';
        contentLabel.htmlFor = 'content-input';
        this.contentInput = document.createElement('textarea');
        this.contentInput.id = 'content-input';
        this.contentInput.classList.add('no-chromatic')
        this.contentInput.placeholder = 'Enter your content...';
        contentGroup.append(contentLabel, this.contentInput);

        // Buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-group';

        // Create buttons
        this.cancelButton = document.createElement('button');
        this.cancelButton.textContent = 'Cancel';
        this.cancelButton.className = 'cancel-button';
        this.cancelButton.type = 'button';

        this.submitButton = document.createElement('button');
        this.submitButton.textContent = 'Submit';
        this.submitButton.className = 'submit-button';
        this.submitButton.type = 'button';

        this.insertButton = document.createElement('button');
        this.insertButton.textContent = 'Insert';
        this.insertButton.className = 'insert-button';
        this.insertButton.type = 'button';
        this.insertButton.style.display = 'none';

        // Add elements to form
        buttonContainer.append(this.cancelButton, this.submitButton, this.insertButton);
        form.append(promptGroup, contentGroup, buttonContainer);
        this.dialog.append(header, form);
        container.appendChild(this.dialog);

        // Add dialog to body
        document.body.appendChild(container);
    }

    private setupEventListeners() {
        this.submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const element = this.submitButton;

                let formattedText = ''

                element.value = 'Generating!!'
                const selectedText = this.selectedText;
                const promptText = this.promptInput.value;
                const stream = await generateText('', selectedText, [], promptText);

                if (stream && stream[Symbol.asyncIterator]) {
                    for await (const chunk of stream) {
                        formattedText = chunk;
                        this.contentInput.value = formattedText;
                    }
                    this.insertButton.style.display = 'block';
                } else {
                    element.value = stream
                }

                element.focus()
            } catch (error) {
                console.error('API call failed:', error);
            } finally {
                this.submitButton.classList.remove('loading');
            }
        });

        this.insertButton.addEventListener('click', () => {
            if (this.callback) {
                this.callback({
                    prompt: this.promptInput.value,
                    content: this.contentInput.value
                });
            }
            this.closeDialog();
        });

        this.cancelButton.addEventListener('click', () => {
            this.closeDialog();
        });

        // Close dialog on click outside
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.closeDialog();
            }
        });
    }

    public openDialog(selecteText, callback: (values: {prompt: string, content: string}) => void) {
        this.selectedText = selecteText;
        this.callback = callback;
        this.resetDialog();
        this.dialog.showModal();
    }

    private closeDialog() {
        this.dialog.close();
        this.resetDialog();
    }

    private resetDialog() {
        this.promptInput.value = '';
        this.contentInput.value = '';
        this.insertButton.style.display = 'none';
        this.submitButton.style.display = 'block';
    }
}

// Export the openDialog function
export const createDialogManager = () => {
    const dialog = new CustomDialog();
    return {
        openDialog: (selectedText, callback: (values: {prompt: string, content: string}) => void) => {
            dialog.openDialog(selectedText, callback);
        }
    };
};
