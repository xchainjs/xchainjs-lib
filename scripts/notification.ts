import { info, setFailed, setOutput } from '@actions/core'

type Package = {
  name: string
  version: string
}

type Embed = Partial<{
  title: string
  color: number
  description: string
  fields: Array<{
    name: string
    value: string
  }>
  thumbnail: {
    url: string
  }
}>

const embedTemplate: Embed = {
  title: 'New XChainJS releases',
  color: 5814783,
  fields: [
    {
      name: 'Do you want more details about the releases?',
      value: 'Check the releases details on the XChainJS repository https://github.com/xchainjs/xchainjs-lib/releases',
    },
  ],
  thumbnail: {
    url: 'https://avatars.githubusercontent.com/u/73146062?s=200&v=4',
  },
}

const main = () => {
  try {
    if (!process.argv[2]) {
      info('There is no release to notify')
      setOutput('success', false)
      return
    }
    const publishedPackages = JSON.parse(process.argv[2]) as Package[]
    const embed: Embed = {
      ...embedTemplate,
      description: publishedPackages
        .map((pkg) => {
          return `${pkg.name}@${pkg.version}`
        })
        .join('\n'),
    }

    setOutput('embeds', [embed])
    setOutput('success', true)
  } catch (e) {
    setFailed(`Error preparing message: ${e}`)
  }
}

main()
