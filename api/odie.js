const handler = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { message, chatHistory, timestamp } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        console.log('Received message:', message);
        console.log('Chat history length:', chatHistory ? chatHistory.length : 0);
        
        // N8N Webhook URL
        const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://kilicphoto.app.n8n.cloud/webhook/odie-chat';
        
        // Test için basit response
        if (message === 'test') {
            return res.status(200).json({
                success: true,
                response: 'Test başarılı! N8N bağlantısı çalışıyor.',
                timestamp: new Date().toISOString()
            });
        }
        
        // Basit AI response (N8N olmadan)
        if (message.toLowerCase().includes('merhaba') || message.toLowerCase().includes('selam')) {
            return res.status(200).json({
                success: true,
                response: 'Merhaba! Ben Odie, Kılıç Agency\'nin AI asistanıyım. Size nasıl yardımcı olabilirim?',
                timestamp: new Date().toISOString()
            });
        }
        
        // Prepare the request to N8N
        const n8nPayload = {
            message: message,
            chatHistory: chatHistory || [],
            timestamp: timestamp || new Date().toISOString(),
            source: 'odie-landing'
        };
        
        console.log('Sending to N8N:', N8N_WEBHOOK_URL);
        
        // Send request to N8N
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Odie-Landing/1.0'
            },
            body: JSON.stringify(n8nPayload)
        });
        
        if (!n8nResponse.ok) {
            console.error('N8N Error:', n8nResponse.status, n8nResponse.statusText);
            throw new Error(`N8N request failed: ${n8nResponse.status}`);
        }
        
        const n8nData = await n8nResponse.json();
        console.log('N8N Response:', n8nData);
        
        // Return the response from N8N
        return res.status(200).json({
            success: true,
            response: n8nData.response || n8nData.message || 'Merhaba! Size nasıl yardımcı olabilirim?',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('API Error:', error);
        
        // Return a fallback response
        return res.status(200).json({
            success: false,
            response: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = handler;
