// DOM Elements
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const openSidebarBtn = document.getElementById('open-sidebar-btn');
const chatHistory = document.getElementById('chat-history');
const petitionInput = document.getElementById('petition-input');
const sendBtn = document.getElementById('send-btn');

// Sidebar Toggle Logic
closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('closed');
    openSidebarBtn.classList.remove('hidden');
});

openSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('closed');
    openSidebarBtn.classList.add('hidden');
});

// Auto-resize textarea
petitionInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.value.trim() !== '') {
        sendBtn.classList.add('active');
    } else {
        sendBtn.classList.remove('active');
    }
});

// Handle Send
sendBtn.addEventListener('click', analyzePetition);
petitionInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        analyzePetition();
    }
});

async function analyzePetition() {
    const text = petitionInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    addMessage(text, 'user');

    // Clear input
    petitionInput.value = '';
    petitionInput.style.height = 'auto';
    sendBtn.classList.remove('active');

    // 2. Add Loading Message
    const loadingId = addLoadingMessage();

    // 3. Call API
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        // Remove loading
        document.getElementById(loadingId).remove();

        // 4. Display AI Result
        if (response.ok) {
            displayAIResponse(data.prediction, data.confidence, data.output);
        } else {
            addMessage(`Error: ${data.detail}`, 'ai', true);
        }

    } catch (error) {
        document.getElementById(loadingId).remove();
        addMessage(`Network Error: Ensure the FastAPI server is running. (${error.message})`, 'ai', true);
    }
}

function addMessage(content, sender, isError = false) {
    const div = document.createElement('div');
    div.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = `avatar ${sender}-avatar`;
    avatar.textContent = sender === 'user' ? 'U' : 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    if (isError) contentDiv.style.color = '#ff6b6b';

    // Simple text-to-html (very basic markdown support for line breaks)
    const formattedContent = content.replace(/\n/g, '<br>');
    contentDiv.innerHTML = `<p>${formattedContent}</p>`;

    div.appendChild(avatar);
    div.appendChild(contentDiv);

    chatHistory.appendChild(div);
    scrollToBottom();
}

function displayAIResponse(prediction, confidence, output) {
    const div = document.createElement('div');
    div.className = `message ai-message`;

    const avatar = document.createElement('div');
    avatar.className = `avatar ai-avatar`;
    avatar.textContent = 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Format the outcome box
    let outcomeClass = prediction.toLowerCase() === 'admitted' ? 'outcome-admitted' : 'outcome-dismissed';

    let htmlContent = `
        <div class="prediction-box ${outcomeClass}">
            <div class="pred-header">AI Classification</div>
            <div class="pred-result">${prediction.toUpperCase()} <span class="confidence">(${confidence} Confidence)</span></div>
        </div>
    `;

    // Process output text
    // Replace markdown-style numbered lists and bullet points with HTML
    let formattedOutput = output.replace(/\n\n/g, '</p><p>');
    formattedOutput = `<p>${formattedOutput}</p>`;

    htmlContent += `<div class="generation-box">${formattedOutput}</div>`;

    contentDiv.innerHTML = htmlContent;

    div.appendChild(avatar);
    div.appendChild(contentDiv);

    chatHistory.appendChild(div);
    scrollToBottom();
}

function addLoadingMessage() {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.className = `message ai-message`;
    div.id = id;

    const avatar = document.createElement('div');
    avatar.className = `avatar ai-avatar`;
    avatar.textContent = 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content loading-content';
    contentDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <span class="loading-text">Analyzing petition (this takes a moment for the LLM)...</span>
    `;

    div.appendChild(avatar);
    div.appendChild(contentDiv);

    chatHistory.appendChild(div);
    scrollToBottom();

    return id;
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
