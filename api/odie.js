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
        const { message, chatHistory, timestamp, type, feedback } = req.body;
        
        // Handle feedback requests
        if (type === 'feedback') {
            console.log('Received feedback:', feedback);
            console.log('Chat history for feedback:', chatHistory ? chatHistory.length : 0);
            
            // N8N Feedback Webhook URL
            const N8N_FEEDBACK_URL = process.env.N8N_FEEDBACK_URL || 'https://kilicphoto.app.n8n.cloud/webhook-test/odie-feedback';
            
            // Prepare feedback payload for N8N
            const feedbackPayload = {
                type: 'feedback',
                feedback: feedback,
                chatHistory: chatHistory || [],
                timestamp: timestamp || new Date().toISOString(),
                source: 'odie-landing'
            };
            
            console.log('Sending feedback to N8N:', N8N_FEEDBACK_URL);
            console.log('Feedback Payload:', JSON.stringify(feedbackPayload, null, 2));
            
            // Send feedback to N8N
            const n8nFeedbackResponse = await fetch(N8N_FEEDBACK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Odie-Landing/1.0'
                },
                body: JSON.stringify(feedbackPayload)
            });
            
            if (!n8nFeedbackResponse.ok) {
                console.error('N8N Feedback Error:', n8nFeedbackResponse.status, n8nFeedbackResponse.statusText);
                throw new Error(`N8N feedback request failed: ${n8nFeedbackResponse.status}`);
            }
            
            const n8nFeedbackData = await n8nFeedbackResponse.json();
            console.log('N8N Feedback Response:', n8nFeedbackData);
            
            return res.status(200).json({
                success: true,
                message: 'Feedback received and processed',
                timestamp: new Date().toISOString()
            });
        }
        
        // Handle regular chat messages
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        console.log('Received message:', message);
        console.log('Chat history length:', chatHistory ? chatHistory.length : 0);
        
        // N8N Webhook URL
        const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://kilicphoto.app.n8n.cloud/webhook-test/odie-chat';
        
        // Test için basit response
        if (message === 'test') {
            return res.status(200).json({
                success: true,
                response: 'Test başarılı! N8N bağlantısı çalışıyor.',
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
        console.log('N8N Payload:', JSON.stringify(n8nPayload, null, 2));
        
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
            
            // If N8N is not available, return a fallback response
            if (n8nResponse.status === 404) {
                return res.status(200).json({
                    success: true,
                    response: 'Merhaba! Şu anda Odie AI sistemimiz güncelleniyor. Size nasıl yardımcı olabilirim? Fotoğraf çekimi, pazarlama veya iş geliştirme konularında sorularınızı yanıtlayabilirim.',
                    timestamp: new Date().toISOString(),
                    fallback: true
                });
            }
            
            throw new Error(`N8N request failed: ${n8nResponse.status}`);
        }
        
        const n8nData = await n8nResponse.json();
        console.log('N8N Response:', n8nData);
        console.log('N8N Response Status:', n8nResponse.status);
        
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
