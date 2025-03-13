# Translation Autocomplete 🚀

Automatically detects **missing translations** in i18n JSON files and fills them using **AI-powered translation APIs** like **Google Translate, DeepL, OpenAI (GPT-4), and Gemini**.

> ✅ **Keep your translations consistent and up-to-date effortlessly!**  

---

## 📌 Features
✔️ **Detect missing translations** in structured JSON files  
✔️ **Automatically translate missing texts** using AI-based APIs  
✔️ **Supports multiple translation services**:  
   - Google Translate 🌍  
   - DeepL 📖  
   - OpenAI (GPT-4) 🤖  
   - Gemini (Google AI) 🔥  
✔️ **CLI tool** for easy project integration  
✔️ **Supports nested JSON structures**  
✔️ **Customizable API settings via CLI or `.env` file**  

---

## 📥 Installation

Install globally via NPM:

```sh
npm install -g translation-autocomplete
```

or use without installation:

```sh
npx translation-autocomplete --help
```

---

## 🚀 Usage Guide

### 🔍 **1. Check for Missing Translations**
Find missing translations in your localization files:

```sh
npx translation-autocomplete check
```

Example Output:
```sh
❌ Missing translations found:
  - home.hero.title (en → tr)
  - home.hero.subtitle (en → tr)
```

---

### 🔄 **2. Auto-Fill Missing Translations**
Automatically translate missing entries using **AI-powered services**:

```sh
npx translation-autocomplete check --fix
```

✅ This command **fills missing translations** and updates JSON files.

Example Output:
```sh
✅ home.hero.title → "Ana Sayfa Başlığı" (Translated using Google Translate)
✅ home.hero.subtitle → "Ana Sayfa Alt Başlığı" (Translated using Google Tanslate)
```

---

### ⚙️ **3. Configure API Settings**
You can set up API keys and preferences via CLI:

```sh
npx translation-autocomplete config
```

This allows you to configure:
- **Translation API key**  
- **Source & target languages**  
- **Translation service (Google, DeepL, OpenAI, Gemini)**  
- **JSON file path**  

---

## 🔧 **Configuration File (`.env`)**
Alternatively, create a `.env` file to store API settings:

```ini
TRANSLATION_API_KEY=your-api-key
SOURCE_LANGUAGE=en
TARGET_LANGUAGES=tr,es,de
TRANSLATION_SERVICE=google
I18N_PATH=./src/messages
```

**Supported Services:**  
- `google` → Google Translate  
- `deepl` → DeepL  
- `openai` → OpenAI GPT-4  
- `gemini` → Google Gemini  

---

## 📖 **Example JSON File Structure**
Translation files should be in **nested JSON format**, like this:

📂 **English (en.json)**
```json
{
  "home": {
    "hero": {
      "title": "Welcome to My Portfolio",
      "description": "I build modern web applications."
    },
    "contact": {
      "cta": "Get in Touch"
    }
  }
}
```

📂 **Turkish (tr.json)**
```json
{
  "home": {
    "hero": {
      "title": "Portföyüme Hoş Geldiniz"
    }
  }
}
```

✅ `check --fix` will **automatically fill missing translations** in `tr.json`.

---

## 🎯 **CLI Commands Overview**
| Command | Description |
|---------|-------------|
| `npx translation-autocomplete check` | Detect missing translations |
| `npx translation-autocomplete check --fix` | Auto-translate missing entries |
| `npx translation-autocomplete config` | Configure API settings |
| `npx translation-autocomplete --help` | Show help menu |

---

## 🌎 **Language Support**

Supports **any language** that is available on Google Translate, DeepL, OpenAI, or Gemini.

---

## 📜 **License**
MIT License © 2025 [Selman Yasin Aktaş](https://github.com/selmanyasin)  

---

## 🌟 **Contribute & Support**
🔹 **Found a bug?** [Open an Issue](https://github.com/selmanyasin/translation-autocomplete/issues)  
🔹 **Want to improve the project?** [Submit a Pull Request](https://github.com/selmanyasin/translation-autocomplete/pulls)  
🔹 **Like this project?** ⭐ **Star it on GitHub!**  

---

## 📢 **Why Use Translation Autocomplete?**
- **✅ Saves time** by automatically filling missing translations  
- **✅ AI-powered translations** for accuracy  
- **✅ CLI-based and easy to integrate into any project**  
- **✅ Supports multiple translation services**  

---

## 💬 **Need Help?**
If you have any questions or feedback, feel free to **open an issue** or reach out via **GitHub discussions**.  

---

## 🚀 **Get Started Today!**
Run this command and ensure your translations are **always up-to-date**:

```sh
npx translation-autocomplete check --fix
```

🔹 **Happy Coding!** 🚀🎯  
