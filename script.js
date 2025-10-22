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
let typingSpeed = 80;
let isListening = false;
let deletingSpeed = 40;
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
        
        // Add feedback buttons for bot messages
        const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        messageDiv.setAttribute('data-message-id', messageId);
        
        // Add feedback buttons after typing is complete
        setTimeout(() => {
            addFeedbackButtons(messageDiv, messageId);
        }, content.length * 50 + 1000); // After typing animation
    } else {
        messageText.textContent = content;
    }
    
    // Scroll to bottom with smooth animation
    setTimeout(() => {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
    
    // Additional scroll after typing animation
    setTimeout(() => {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }, 500);
    
    // Force scroll to bottom
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
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
            chatMessages.scrollTo({
                top: chatMessages.scrollHeight,
                behavior: 'smooth'
            });
            
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
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
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

// V2 Navigation Functions
function initV2Navigation() {
    const hamburger = document.getElementById('v2-hamburger');
    const navLinks = document.querySelector('.v2-nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('.v2-nav-link');
        links.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

// V2 Feedback System
function addFeedbackButtons(messageElement, messageId) {
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'v2-feedback-container';
    feedbackContainer.innerHTML = `
        <button class="v2-feedback-btn v2-like-btn" data-rating="like">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
        <button class="v2-feedback-btn v2-dislike-btn" data-rating="dislike">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `;
    
    // Add event listeners
    const likeBtn = feedbackContainer.querySelector('.v2-like-btn');
    const dislikeBtn = feedbackContainer.querySelector('.v2-dislike-btn');
    
    likeBtn.addEventListener('click', () => handleFeedback(messageId, 'like', likeBtn, dislikeBtn));
    dislikeBtn.addEventListener('click', () => handleFeedback(messageId, 'dislike', likeBtn, dislikeBtn));
    
    messageElement.appendChild(feedbackContainer);
}

function handleFeedback(messageId, rating, likeBtn, dislikeBtn) {
    // Store feedback in localStorage
    const feedback = {
        messageId: messageId,
        rating: rating,
        timestamp: Date.now(),
        conversationId: 'current'
    };
    
    let feedbackArray = JSON.parse(localStorage.getItem('odie_feedback') || '[]');
    feedbackArray.push(feedback);
    localStorage.setItem('odie_feedback', JSON.stringify(feedbackArray));
    
    // Visual feedback
    if (rating === 'like') {
        likeBtn.classList.add('v2-selected');
        dislikeBtn.disabled = true;
    } else {
        dislikeBtn.classList.add('v2-selected');
        likeBtn.disabled = true;
    }
    
    // Disable both buttons
    likeBtn.disabled = true;
    dislikeBtn.disabled = true;
}

// V2 Scroll to Top
function initScrollToTop() {
    const scrollBtn = document.getElementById('v2-scroll-to-top');
    
    if (scrollBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when clicked
        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// V2 Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('v2-theme-toggle');
    const body = document.body;
    
    // Load saved theme (default to dark)
    const savedTheme = localStorage.getItem('odie_theme') || 'dark';
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.classList.add('dark');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-theme');
            themeToggle.classList.toggle('dark');
            
            // Save theme preference
            const isDark = body.classList.contains('dark-theme');
            localStorage.setItem('odie_theme', isDark ? 'dark' : 'light');
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize V2 Navigation
    initV2Navigation();
    
    // Initialize V2 Scroll to Top
    initScrollToTop();
    
    // Initialize V2 Theme Toggle
    initThemeToggle();
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
        
        // Add keypress listener for Enter key
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleFirstMessage();
            }
        });
    }
    
    // Landing page send button event listener
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', handleFirstMessage);
    }
    
    // Chat interface send button event listener
    const sendBtnChat = document.getElementById('send-btn-chat');
    if (sendBtnChat) {
        sendBtnChat.addEventListener('click', handleSendMessage);
    }
    
    // Chat interface enter key to send message
    const chatInputChat = document.getElementById('chat-input-chat');
    if (chatInputChat) {
        chatInputChat.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }
    
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
