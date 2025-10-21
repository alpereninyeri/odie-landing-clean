# Odie - Kılıç Agency AI Asistanı

Modern ve etkileşimli AI asistan landing page'i.

## 🚀 Özellikler

- **Modern Tasarım**: Siyah tema ile minimalist arayüz
- **Animasyonlu Giriş**: Yazma efekti ile dinamik mesajlar
- **Gerçek Zamanlı Chat**: N8N webhook entegrasyonu
- **Responsive**: Mobil ve desktop uyumlu
- **Vercel Ready**: Hemen deploy edilebilir

## 📁 Proje Yapısı

```
odie-landing-clean/
├── index.html          # Ana sayfa
├── styles.css          # CSS stilleri
├── script.js           # JavaScript fonksiyonları
├── api/
│   └── odie.js         # N8N webhook handler
├── vercel.json         # Vercel konfigürasyonu
├── package.json        # Proje bağımlılıkları
└── README.md           # Bu dosya
```

## 🛠️ Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd odie-landing-clean
```

2. **Vercel'e deploy edin:**
```bash
vercel
```

## ⚙️ Konfigürasyon

### Environment Variables (Vercel Dashboard'da ayarlayın):

- `N8N_WEBHOOK_URL`: N8N webhook URL'iniz

### N8N Webhook Format:

```json
{
  "message": "Kullanıcı mesajı",
  "chatHistory": [
    {
      "role": "user",
      "parts": [{"text": "Merhaba"}]
    }
  ],
  "timestamp": "2025-01-21T19:49:00.000Z",
  "source": "odie-landing"
}
```

## 🎨 Özelleştirme

- **Renkler**: `styles.css` dosyasında `#E94E1B` (turuncu) ana renk
- **Fontlar**: JetBrains Mono ve Poppins
- **Animasyonlar**: CSS transitions ve keyframes

## 📱 Responsive

- Mobile-first tasarım
- Tablet ve desktop optimizasyonu
- Touch-friendly interface

## 🔧 Geliştirme

```bash
# Local development
npm run dev

# Build
npm run build
```

## 📄 Lisans

MIT License - Kılıç Agency
