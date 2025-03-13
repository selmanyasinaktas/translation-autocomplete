import * as dotenv from 'dotenv'
import { z } from 'zod'
import * as fs from 'fs-extra'

dotenv.config()

const SupportedServices = z.enum(['google', 'deepl', 'openai', 'gemini'])

const ConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  sourceLanguage: z.string().default('en'),
  targetLanguages: z.array(z.string()).default(['tr', 'fr', 'de']),
  translationService: SupportedServices.default('google'),
  i18nPath: z.string().default('./src/messages'),
})

export type Config = z.infer<typeof ConfigSchema>

export function loadConfig(): Config {
  if (!fs.existsSync('.env')) {
    console.log(
      '⚠️ .env dosyası bulunamadı, varsayılan ayarlar oluşturuluyor...'
    )
    const defaultEnv = `
TRANSLATION_API_KEY=
SOURCE_LANGUAGE=en
TARGET_LANGUAGES=tr,fr,de
TRANSLATION_SERVICE=google
I18N_PATH=./src/messages
    `.trim()
    fs.writeFileSync('.env', defaultEnv)
  }

  try {
    return ConfigSchema.parse({
      apiKey: process.env.TRANSLATION_API_KEY || '',
      sourceLanguage: process.env.SOURCE_LANGUAGE || 'en',
      targetLanguages: process.env.TARGET_LANGUAGES
        ? process.env.TARGET_LANGUAGES.split(',')
        : ['tr', 'fr', 'de'],
      translationService: process.env.TRANSLATION_SERVICE || 'google',
      i18nPath: process.env.I18N_PATH || './src/messages',
    })
  } catch (error) {
    console.error('⚠️ Config dosyası hatalı:', error)
    throw error
  }
}
