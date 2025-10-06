import net from 'net'
import SettingsRepository from '../repositories/Methods/SettingsRepository'


export const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.listen(port, () => {
      server.once('close', () => {
        resolve(true)
      })
      server.close()
    })

    server.on('error', () => {
      resolve(false)
    })
  })
}


export const findAvailablePort = async (
  startPort: number = 8080,
  maxAttempts: number = 100
): Promise<number> => {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i
    const available = await isPortAvailable(port)

    if (available) {
      return port
    }
  }

  throw new Error(
    `No available port found starting from ${startPort} after ${maxAttempts} attempts`
  )
}


export const getPreferredPort = async (settingsRepository: SettingsRepository): Promise<number> => {
  try {
    const webUISettings = await settingsRepository.methods.getWebUISettings()
    if (webUISettings.autoPort !== false) {
      return 8080
    }
    return webUISettings.port || 8080
  } catch (error) {
    return 8080
  }
}


export const getPortToUse = async (
  settingsRepository: SettingsRepository | null,
  defaultStartPort: number = 8080
): Promise<number> => {
  let preferredPort: number

  if (settingsRepository) {
    preferredPort = await getPreferredPort(settingsRepository)
  } else {
    preferredPort = defaultStartPort
  }

  const isAvailable = await isPortAvailable(preferredPort)

  if (isAvailable) {
    return preferredPort
  }

  return await findAvailablePort(preferredPort)
}
