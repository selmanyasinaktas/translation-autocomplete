# Translation Autocomplete 🚀

Automatically detect missing translations in your i18n files and fill them using AI-powered translation APIs like Google Translate, DeepL, OpenAI, and Gemini.

## 📌 Features
✅ Detects missing translations in JSON-based i18n files  
✅ Supports Google Translate, DeepL, OpenAI (GPT-4), and Gemini  
✅ CLI tool for easy integration into projects  

---

## 📥 Installation

```sh
npm install -g translation-autocomplete
```

---

## 🚀 Usage

### 🔍 Check for missing translations
```sh
npx translation-autocomplete check
```

### 🔄 Fix missing translations automatically
```sh
npx translation-autocomplete check --fix
```

### ⚙️ Configure API settings
```sh
npx translation-autocomplete config
```

---

## 🔧 Configuration (`.env` file)

Create a `.env` file in the root directory:
```ini
TRANSLATION_API_KEY=your-api-key
SOURCE_LANGUAGE=en
TARGET_LANGUAGES=tr,es,de
TRANSLATION_SERVICE=google
I18N_PATH=./src/messages
```

---

## 💡 Türkçe Kullanım Kılavuzu
### 📥 Kurulum

```sh
npm install -g translation-autocomplete
```

### 🧐 Eksik Çevirileri Kontrol Etme
```sh
npx translation-autocomplete check
```

### 🔄 Eksik Çevirileri Tamamlama
```sh
npx translation-autocomplete check --fix
```

### ⚙️ API ve Dil Ayarlarını Yapılandırma
```sh
npx translation-autocomplete config
```

---

## 📜 License
MIT License © 2025 [Selman Yasin Aktaş](https://github.com/selmanyasin)
