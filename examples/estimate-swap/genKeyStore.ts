import { generatePhrase, validatePhrase, encryptToKeyStore } from "@xchainjs/xchain-crypto"
import { readFileSync, writeFileSync } from 'fs';

const password = process.argv[1]

const GenerateKeystore = async () => {
    const phrase = generatePhrase(24)
    console.log(`${phrase}`)
    const isCorrect = validatePhrase(phrase)
    console.log(`Phrase valid?: ${isCorrect}`)
    const keystore = await encryptToKeyStore(phrase, password)
    writeFileSync(process.argv[2], JSON.stringify(keystore, null, 4), 'utf8')
}

GenerateKeystore();