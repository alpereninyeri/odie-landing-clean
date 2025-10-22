// N8N Webhook Configuration
const N8N_WEBHOOK_URL = '/api/odie';

// Professional intro messages
const introMessages = [
    "Merhaba! Ben Odie, Kılıç Agency'nin AI asistanıyım. Size nasıl yardımcı olabilirim?",
    "Fotoğraf ve video prodüksiyon hizmetlerimiz hakkında bilgi almak ister misiniz?",
    "Kreatif projeleriniz için en uygun çözümleri birlikte bulalım!",
    "Sosyal medya içerikleri, kurumsal videolar ve daha fazlası...",
    "Hangi konuda yardıma ihtiyacınız var?"
];

// 20 different dynamic subtitle texts (randomized)
const typingTexts = [
    "Ne yapmak istersin?",
    "Kreatif projelerin için buradayım.",
    "Fotoğraf ve video prodüksiyon uzmanıyım.",
    "Sosyal medya içerikleri konusunda yardımcı olabilirim.",
    "Kurumsal videolar ve reklam filmleri alanında deneyimliyim.",
    "Etkinlik fotoğrafçılığı ve video çekimi yapıyoruz.",
    "Ürün fotoğrafçılığı ve e-ticaret görselleri hazırlıyoruz.",
    "Logo tasarımı ve kurumsal kimlik çalışmaları yapıyoruz.",
    "Web tasarımı ve dijital pazarlama hizmetleri sunuyoruz.",
    "İçerik üretimi ve sosyal medya yönetimi konularında uzmanız.",
    "Kurumsal etkinlikler ve organizasyonlar için çözümler üretiyoruz.",
    "Dijital dünyada markanızı öne çıkaracak içerikler hazırlıyoruz.",
    "Profesyonel fotoğraf ve video çekimi hizmetleri veriyoruz.",
    "Kreatif fikirler ve yaratıcı çözümler konusunda uzmanız.",
    "Markanızın hikayesini görsel olarak anlatıyoruz.",
    "Dijital pazarlama stratejileri ve içerik planlaması yapıyoruz.",
    "Kurumsal tanıtım filmleri ve reklam videoları üretiyoruz.",
    "Sosyal medya platformları için özel içerikler hazırlıyoruz.",
    "Kılıç Agency'nin yaratıcı zekâsıyım.",
    "Hangi konuda yardıma ihtiyacınız var?"
];

let currentTextIndex = Math.floor(Math.random() * typingTexts.length);
let currentCharIndex = 0;
let isDeleting = false;
let typingSpeed = 100;
let isListening = false;
let deletingSpeed = 50;
let pauseTime = 2000;

// Chat functionality
let chatHistory = [];

function typeText() {
    const typingElement = document.getElementById('typing-text');
    const currentText = typingTexts[currentTextIndex];
    
    if (isDeleting) {
        // Deleting text
        typingElement.textContent = currentText.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        
        if (currentCharIndex === 0) {
            isDeleting = false;
            currentTextIndex = Math.floor(Math.random() * typingTexts.length);
            setTimeout(typeText, 500);
            return;
        }
        
        setTimeout(typeText, deletingSpeed);
    } else {
        // Typing text
        typingElement.textContent = currentText.substring(0, currentCharIndex + 1);
        currentCharIndex++;
        
        if (currentCharIndex === currentText.length) {
            isDeleting = true;
            setTimeout(typeText, pauseTime);
            return;
        }
        
        setTimeout(typeText, typingSpeed);
    }
}

// Chat Functions
function focusChat() {
    document.getElementById('chat-input').focus();
}

// Handle first message and switch to chat interface
async function handleFirstMessage() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Disable input and button
    chatInput.disabled = true;
    sendBtn.disabled = true;
    
    // Switch to chat interface
    const landingPage = document.getElementById('landing-page');
    const chatInterface = document.getElementById('chat-interface');
    
    // Start fade out animation
    landingPage.classList.add('fade-out');
    
    // Wait for fade out to complete, then show chat
    setTimeout(() => {
        landingPage.style.display = 'none';
        chatInterface.style.display = 'flex';
        chatInterface.classList.add('show');
    }, 500);
    
    // Add user message to chat first
    addMessage(message, true);
    
    // Show thinking indicator
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message bot-message';
    thinkingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="message-text">Düşünüyorum...</div>
        </div>
    `;
    document.getElementById('chat-messages').appendChild(thinkingDiv);
    
    try {
        // Get response from N8N
        const response = await sendToN8N(message);
        
        // Remove thinking indicator
        thinkingDiv.remove();
        
        // Add bot response to chat
        addMessage(response);
        
    } catch (error) {
        // Remove thinking indicator
        thinkingDiv.remove();
        addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
        // Focus chat input
        document.getElementById('chat-input-chat').focus();
    }
}

// Add message to chat
function addMessage(content, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message bot-message';
    
    // Create avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? 'U' : '🤖';
    
    // Create message content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    messageContent.appendChild(messageText);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    // Add animation
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    
    chatMessages.appendChild(messageDiv);
    
    // Trigger animation
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.5s ease-out';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 50);
    
    // Type message word by word for bot messages
    if (!isUser) {
        typeMessageWordByWord(messageText, content);
    } else {
        messageText.textContent = content;
    }
    
    // Scroll to bottom with smooth animation
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
    
    // Additional scroll after typing animation
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
}

// Type message word by word
function typeMessageWordByWord(element, text) {
    const words = text.split(' ');
    let currentWordIndex = 0;
    
    function typeNextWord() {
        if (currentWordIndex < words.length) {
            const word = words[currentWordIndex];
            element.textContent += (currentWordIndex > 0 ? ' ' : '') + word;
            currentWordIndex++;
            
            // Scroll to bottom during typing
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Random delay between words (50-150ms)
            const delay = Math.random() * 100 + 50;
            setTimeout(typeNextWord, delay);
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeNextWord, 200);
}

// Show typing indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.id = 'typing-indicator';
    
    // Create avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '';
    
    // Create typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator active';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingDiv.appendChild(dot);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(typingDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Send message to N8N Webhook
async function sendToN8N(message) {
    try {
        console.log('Sending message to N8N webhook:', message);
        
        // Add user message to history
        chatHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });
        
        const requestBody = {
            message: message,
            chatHistory: chatHistory,
            timestamp: new Date().toISOString()
        };
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('N8N Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('N8N Response:', data);
        
        if (data.response) {
            const botResponse = data.response;
            
            // Add bot response to history
            chatHistory.push({
                role: 'model',
                parts: [{ text: botResponse }]
            });
            
            return botResponse;
        } else {
            console.error('Invalid response format:', data);
            throw new Error('Invalid response format from N8N webhook');
        }
        
    } catch (error) {
        console.error('Error calling N8N webhook:', error);
        
        // More specific error messages
        if (error.message.includes('Failed to fetch')) {
            return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
        } else if (error.message.includes('404')) {
            return 'API endpoint bulunamadı. Lütfen daha sonra tekrar deneyin.';
        } else if (error.message.includes('500')) {
            return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        } else {
            return `Üzgünüm, şu anda bir hata oluştu: ${error.message}. Lütfen tekrar deneyin.`;
        }
    }
}

// Handle send message
async function handleSendMessage() {
    const chatInput = document.getElementById('chat-input-chat');
    const sendBtn = document.getElementById('send-btn-chat');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Disable input and button
    chatInput.disabled = true;
    sendBtn.disabled = true;
    
    // Add user message to chat
    addMessage(message, true);
    
    // Clear input
    chatInput.value = '';
    
    // Show thinking indicator
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message bot-message';
    thinkingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="message-text">Düşünüyorum...</div>
        </div>
    `;
    document.getElementById('chat-messages').appendChild(thinkingDiv);
    
    try {
        // Get response from N8N
        const response = await sendToN8N(message);
        
        // Remove thinking indicator
        thinkingDiv.remove();
        
        // Add bot response to chat
        addMessage(response);
        
    } catch (error) {
        // Remove thinking indicator
        thinkingDiv.remove();
        addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
        // Re-enable input and button
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }
}

// Page transition functions
// Removed old animation functions - now using CSS transitions

// Show action text animation
function showActionText() {
    const actionText = document.getElementById('action-text');
    if (actionText) {
        actionText.style.opacity = '0';
        actionText.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            actionText.style.transition = 'all 0.5s ease-out';
            actionText.style.opacity = '1';
            actionText.style.transform = 'translateY(0)';
        }, 1000);
        
        // Hide after 4 seconds
        setTimeout(() => {
            actionText.style.transition = 'all 0.5s ease-out';
            actionText.style.opacity = '0';
            actionText.style.transform = 'translateY(-20px)';
        }, 5000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Page enter animation removed
    
    // Start typing animation after a short delay
    setTimeout(typeText, 100);
    
    // Show action text animation
    setTimeout(showActionText, 2000);
    
    // Focus chat input immediately
    setTimeout(focusChat, 100);
    
    // Add keyboard listener for input focus
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('focus', function() {
            if (!isListening) {
                isListening = true;
                const typingElement = document.getElementById('typing-text');
                if (typingElement) {
                    typingElement.textContent = 'Dinliyorum...';
                }
            }
        });
        
        chatInput.addEventListener('blur', function() {
            if (isListening && chatInput.value.trim() === '') {
                isListening = false;
                // Restart typing animation
                currentTextIndex = Math.floor(Math.random() * typingTexts.length);
                currentCharIndex = 0;
                isDeleting = false;
                typeText();
            }
        });
        
        chatInput.addEventListener('input', function() {
            if (!isListening) {
                isListening = true;
                const typingElement = document.getElementById('typing-text');
                if (typingElement) {
                    typingElement.textContent = 'Dinliyorum...';
                }
            }
        });
    }
    
    // Landing page send button event listener
    const sendBtn = document.getElementById('send-btn');
    sendBtn.addEventListener('click', handleFirstMessage);
    
    // Landing page enter key to send message
    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleFirstMessage();
        }
    });
    
    // Chat interface send button event listener
    const sendBtnChat = document.getElementById('send-btn-chat');
    sendBtnChat.addEventListener('click', handleSendMessage);
    
    // Chat interface enter key to send message
    const chatInputChat = document.getElementById('chat-input-chat');
    chatInputChat.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Add some interactive effects
    document.addEventListener('mousemove', function(e) {
        const cursor = document.querySelector('.cursor');
        if (cursor) {
            // Subtle cursor animation based on mouse movement
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            cursor.style.transform = `translate(${x * 2}px, ${y * 2}px)`;
        }
    });
});
