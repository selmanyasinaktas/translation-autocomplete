#!/usr/bin/env node
import { Command } from 'commander'
import fs from 'fs-extra'
import { blue, bold, red, green, yellow, cyan } from 'colorette'
import * as cliProgress from 'cli-progress'
import { Table } from 'console-table-printer'
import { checkTranslations, fixTranslations } from '../src/translation'
import { loadConfig } from '../src/config'
import { table } from 'table'

const program = new Command()
const config = loadConfig()

program
  .name('translation-autocomplete')
  .description('i18n translation autocomplete tool')
  .version('1.0.3')

/**
 * HELP KOMUTU - Kullanıcıya yardım sağlar
 */
program
  .command('help')
  .description('Shows command list and usage examples')
  .action(() => {
    console.log(
      bold(
        blue(`
  Available Commands:

  - check          Check for missing translations
  - check --fix    Automatically complete missing translations
  - config         Update configuration via CLI
  - help           Show help screen
  
  Usage Examples:
  $ npx translation-autocomplete check
  $ npx translation-autocomplete check --fix
  $ npx translation-autocomplete config
  `)
      )
    )
  })

/**
 * CONFIG KOMUTU - Kullanıcıya CLI üzerinden yapılandırma ayarlarını değiştirme imkanı sağlar
 */
program
  .command('config')
  .description('Update configuration settings via CLI')
  .action(async () => {
    const readline = (await import('readline')).default.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const askQuestion = (question: string): Promise<string> => {
      return new Promise((resolve) => readline.question(question, resolve))
    }

    if (!fs.existsSync('.env')) {
      console.log(
        bold(blue('⚠️ .env file not found, creating with default settings...'))
      )
      fs.writeFileSync(
        '.env',
        `TRANSLATION_API_KEY=
SOURCE_LANGUAGE=en
TARGET_LANGUAGES=tr,fr,de
TRANSLATION_SERVICE=google
I18N_PATH=./src/messages
      `.trim()
      )
    }

    const config = loadConfig()

    console.log(bold(blue('\n🌍 Update Translation Settings\n')))

    const newApiKey = await askQuestion(
      `Enter new API Key (current: ${config.apiKey || 'NONE'}): `
    )
    if (!newApiKey) {
      console.log(bold(red('❌ API Key cannot be empty!')))
      readline.close()
      return
    }

    const newSourceLang = await askQuestion(
      `Enter source language code (current: ${config.sourceLanguage}): `
    )
    const newTargetLangs = await askQuestion(
      `Enter target languages (comma-separated) (current: ${config.targetLanguages.join(
        ', '
      )}): `
    )
    const newService = await askQuestion(
      `Select API service (google, deepl, openai, gemini) (current: ${config.translationService}): `
    )
    const newI18nPath = await askQuestion(
      `Enter i18n directory path (current: ${config.i18nPath}): `
    )

    readline.close()

    const newConfig = {
      apiKey: newApiKey || config.apiKey,
      sourceLanguage: newSourceLang || config.sourceLanguage,
      targetLanguages: newTargetLangs
        ? newTargetLangs.split(',')
        : config.targetLanguages,
      translationService: newService || config.translationService,
      i18nPath: newI18nPath || config.i18nPath,
    }

    fs.writeFileSync(
      '.env',
      `
TRANSLATION_API_KEY=${newConfig.apiKey}
SOURCE_LANGUAGE=${newConfig.sourceLanguage}
TARGET_LANGUAGES=${newConfig.targetLanguages.join(',')}
TRANSLATION_SERVICE=${newConfig.translationService}
I18N_PATH=${newConfig.i18nPath}
    `.trim()
    )

    console.log(bold(green('\n✅ Configuration updated successfully!')))
  })

/**
 * CHECK KOMUTU - Eksik çevirileri tespit eder ve isteğe bağlı olarak tamamlar
 */
program
  .command('check')
  .description('Check for missing translations')
  .option('--fix', 'Automatically complete missing translations')
  .action(async (options) => {
    try {
      console.log(blue('\n🔍 Scanning for missing translations...\n'))
      const missingTranslations = await checkTranslations(config)

      if (missingTranslations.length === 0) {
        console.log(green('✅ No missing translations found!\n'))
        return
      }

      console.log(
        yellow(`📊 Found ${missingTranslations.length} missing translations.\n`)
      )

      if (options.fix) {
        const translations = new Map<string, string>()

        const progressBar = new cliProgress.SingleBar({
          format: '🔄 Progress: [{bar}] {percentage}% | {value}/{total}',
          barCompleteChar: '█',
          barIncompleteChar: '░',
          hideCursor: true,
          clearOnComplete: false,
          stopOnComplete: true,
          barsize: 30,
        })

        console.log(blue('🚀 Starting translations...\n'))
        progressBar.start(missingTranslations.length, 0)

        await fixTranslations(
          config,
          ({ completed, total, current, translation }) => {
            if (translation) {
              translations.set(current, translation)
            }
            progressBar.update(completed)
          }
        )

        progressBar.stop()

        const tableData = [
          [blue('🔑 Key'), yellow('📝 Source Text'), green('🌍 Translation')],
          ...missingTranslations.map(({ key, value }) => [
            key,
            value,
            translations.has(key)
              ? green('✓ ' + translations.get(key))
              : red('❌ Translation failed'),
          ]),
        ]

        const tableConfig = {
          border: {
            topBody: '─',
            topJoin: '┬',
            topLeft: '┌',
            topRight: '┐',
            bottomBody: '─',
            bottomJoin: '┴',
            bottomLeft: '└',
            bottomRight: '┘',
            bodyLeft: '│',
            bodyRight: '│',
            bodyJoin: '│',
            joinBody: '─',
            joinLeft: '├',
            joinRight: '┤',
            joinJoin: '┼',
          },
          columns: [
            { alignment: 'left' as const, width: 30 },
            { alignment: 'left' as const, width: 40 },
            { alignment: 'left' as const, width: 40 },
          ],
        }

        console.log('\n📋 Translation Results:\n')
        console.log(table(tableData, tableConfig))
        console.log(green('\n✅ Translation process completed!\n'))
      } else {
        console.log(
          blue(
            '\n💡 To complete translations, run: npx translation-autocomplete check --fix\n'
          )
        )
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(red(`\n❌ Error: ${error.message}\n`))
      } else {
        console.error(red('\n❌ An unexpected error occurred\n'))
      }
      process.exit(1)
    }
  })

program.parse()
