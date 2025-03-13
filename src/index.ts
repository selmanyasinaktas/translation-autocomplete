import { checkTranslations } from './translation'
import { loadConfig } from './config'

async function main() {
  const config = loadConfig()
  await checkTranslations(config)
}

main()
