import axios from 'axios'
import * as fs from 'fs-extra'
import * as path from 'path'
import { Config } from './config'
import { setTimeout } from 'timers/promises'
import https from 'https'

interface TranslationEntry {
  key: string
  value: string
  missing: string[]
}

type TranslationsType = Record<string, string>

interface FileError extends Error {
  code?: string
}

const RATE_LIMIT_DELAY = 1000 // 1 second
const MAX_RETRIES = 3
const BATCH_SIZE = 10

const axiosInstance = axios.create({
  timeout: 10000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: true,
  }),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      if (i > 0) await setTimeout(RATE_LIMIT_DELAY)
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (!axios.isAxiosError(error)) throw error
      if (error.response?.status !== 429) throw error // If not rate limit
    }
  }
  throw lastError
}

async function validateFile(filePath: string): Promise<void> {
  try {
    const stats = await fs.stat(filePath)
    if (!stats.isFile()) {
      throw new Error(`Invalid file: ${filePath}`)
    }
    if (stats.size === 0) {
      throw new Error(`Empty file: ${filePath}`)
    }
  } catch (error) {
    const fileError = error as FileError
    if (fileError.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`)
    }
    throw new Error(`File validation error: ${fileError.message}`)
  }
}

interface ProgressCallback {
  (progress: { completed: number; total: number; current: string }): void
}

export function sanitizeKey(text: string): string {
  // Convert dots to underscores and clean special characters
  return text
    .replace(/\./g, '_') // Convert dots to underscores
    .replace(/[^\w\s-]/g, '') // Keep only letters, numbers, dashes and spaces
    .replace(/\s+/g, '_') // Convert spaces to underscores
    .toLowerCase() // Convert to lowercase
    .replace(/^_+|_+$/g, '') // Remove leading and trailing underscores
}

export function flattenObject(obj: any, prefix = ''): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, k: string) => {
    const pre = prefix.length ? prefix + '.' : ''
    if (
      typeof obj[k] === 'object' &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k))
    } else {
      acc[pre + k] = obj[k]
    }
    return acc
  }, {})
}

export function setNestedValue(
  obj: Record<string, any>,
  path: string,
  value: any
): void {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key]) {
      current[key] = {}
    }
    current = current[key]
  }

  const lastKey = keys[keys.length - 1]
  current[lastKey] = value
}

export async function checkTranslations(
  config: Config,
  onProgress?: ProgressCallback
): Promise<TranslationEntry[]> {
  const missingTranslations: TranslationEntry[] = []
  const sourceFile = path.join(
    process.cwd(),
    config.i18nPath,
    `${config.sourceLanguage}.json`
  )

  await validateFile(sourceFile)
  const sourceTranslations = await fs.readJson(sourceFile)
  const flattenedSource = flattenObject(sourceTranslations)

  for (const targetLang of config.targetLanguages) {
    const targetFile = path.join(
      process.cwd(),
      config.i18nPath,
      `${targetLang}.json`
    )

    if (fs.existsSync(targetFile)) {
      try {
        const targetTranslations = await fs.readJson(targetFile)
        const flattenedTarget = flattenObject(targetTranslations)

        for (const [key, value] of Object.entries(flattenedSource)) {
          if (!flattenedTarget[key]) {
            const entry = missingTranslations.find((e) => e.key === key)
            if (entry) {
              entry.missing.push(targetLang)
            } else {
              missingTranslations.push({
                key,
                value: String(value),
                missing: [targetLang],
              })
            }
          }
        }
      } catch (error) {
        const err = error as Error
        throw new Error(`${targetFile} dosyası okunamadı: ${err.message}`)
      }
    } else {
      // Hedef dil dosyası yoksa, tüm kaynak çevirileri eksik olarak işaretle
      for (const [key, value] of Object.entries(flattenedSource)) {
        missingTranslations.push({
          key,
          value: String(value),
          missing: [targetLang],
        })
      }
    }
  }

  return missingTranslations
}

export async function translateText(
  text: string,
  targetLang: string,
  config: Config
): Promise<string> {
  try {
    let translatedText = ''

    if (config.translationService === 'google') {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${config.apiKey}`,
        { q: text, target: targetLang, source: config.sourceLanguage }
      )
      translatedText =
        response.data?.data?.translations?.[0]?.translatedText || ''
    } else if (config.translationService === 'deepl') {
      const response = await axios.post(
        'https://api-free.deepl.com/v2/translate',
        {
          text: [text],
          target_lang: targetLang.toUpperCase(),
          source_lang: config.sourceLanguage.toUpperCase(),
        },
        {
          headers: { Authorization: `DeepL-Auth-Key ${config.apiKey}` },
        }
      )
      translatedText = response.data?.translations?.[0]?.text || ''
    } else if (config.translationService === 'openai') {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text to ${targetLang}:`,
            },
            { role: 'user', content: text },
          ],
          max_tokens: 100,
        },
        {
          headers: { Authorization: `Bearer ${config.apiKey}` },
        }
      )
      translatedText =
        response.data?.choices?.[0]?.message?.content.trim() || ''
    } else if (config.translationService === 'gemini') {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText',
        {
          prompt: {
            text: `Translate the following text to ${targetLang}: "${text}"`,
          },
          max_output_tokens: 100,
        },
        {
          headers: { Authorization: `Bearer ${config.apiKey}` },
        }
      )
      translatedText = response.data?.candidates?.[0]?.output.trim() || ''
    } else {
      throw new Error('Invalid translation service!')
    }

    return translatedText
  } catch (error) {
    console.error('⚠️ Translation error:', error)
    return ''
  }
}

export async function fixTranslations(
  config: Config,
  onProgress?: (progress: {
    completed: number
    total: number
    current: string
    translation?: string
  }) => void
): Promise<void> {
  const missingTranslations = await checkTranslations(config)
  let completed = 0

  for (const { key, value, missing } of missingTranslations) {
    for (const targetLang of missing) {
      const targetFile = path.join(
        process.cwd(),
        config.i18nPath,
        `${targetLang}.json`
      )

      // Read existing translations or create new object
      let currentTranslations: Record<string, any> = {}
      if (await fs.pathExists(targetFile)) {
        currentTranslations = await fs.readJson(targetFile)
      }

      const translation = await translateText(value, targetLang, config)

      if (translation) {
        setNestedValue(currentTranslations, key, translation)
        await fs.writeJson(targetFile, currentTranslations, { spaces: 2 })
      }

      completed++
      if (onProgress) {
        onProgress({
          completed,
          total: missingTranslations.length * config.targetLanguages.length,
          current: key,
          translation,
        })
      }
    }
  }
}

async function saveTranslations(
  targetFile: string,
  updates: Array<{ key: string; value: string }>
): Promise<void> {
  try {
    console.log(`📝 Updated file: ${targetFile}`)

    let currentTranslations = {}

    // Read file contents if exists
    if (await fs.pathExists(targetFile)) {
      currentTranslations = await fs.readJson(targetFile)
    } else {
      console.warn(`⚠️ File not found, creating: ${targetFile}`)
    }

    // Add new translations to JSON in nested format
    for (const { key, value } of updates) {
      setNestedValue(currentTranslations, key, value)
      console.log(`✅ "${key}" added: "${value}"`)
    }

    // Save updated JSON
    await fs.writeJson(targetFile, currentTranslations, { spaces: 2 })
    console.log(`📁 ${targetFile} updated successfully.`)
  } catch (error) {
    console.error(`❌ Failed to save translations: ${(error as Error).message}`)
  }
}

async function translateBatch(
  texts: string[],
  targetLang: string,
  config: Config
): Promise<
  Array<{ text: string; translation: string | null; error?: string }>
> {
  const results = []
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.allSettled(
      batch.map((text) => translateText(text, targetLang, config))
    )

    results.push(
      ...batchResults.map((result, index) => ({
        text: batch[index],
        translation: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : undefined,
      }))
    )

    if (i + BATCH_SIZE < texts.length) {
      await setTimeout(RATE_LIMIT_DELAY)
    }
  }
  return results
}

async function* iterateTranslations(sourceTranslations: TranslationsType) {
  const batchSize = 100
  const entries = Object.entries(sourceTranslations)

  for (let i = 0; i < entries.length; i += batchSize) {
    yield entries.slice(i, i + batchSize)
  }
}
