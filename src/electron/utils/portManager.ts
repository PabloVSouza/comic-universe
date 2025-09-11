import net from 'net'

/**
 * Check if a port is available
 */
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

/**
 * Find the next available port starting from a given port
 */
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

/**
 * Get the preferred port from settings or use default
 */
export const getPreferredPort = async (settingsRepository: any): Promise<number> => {
  try {
    const webUISettings = await settingsRepository.methods.getWebUISettings()
    // If auto port is enabled, always use default port
    if (webUISettings.autoPort !== false) {
      return 8080
    }
    return webUISettings.port || 8080
  } catch (error) {
    return 8080
  }
}

/**
 * Get the actual port to use (preferred port if available, or next available)
 */
export const getPortToUse = async (
  settingsRepository: any,
  defaultStartPort: number = 8080
): Promise<number> => {
  let preferredPort: number

  if (settingsRepository) {
    preferredPort = await getPreferredPort(settingsRepository)
  } else {
    preferredPort = defaultStartPort
  }

  // Check if preferred port is available
  const isAvailable = await isPortAvailable(preferredPort)

  if (isAvailable) {
    return preferredPort
  }

  // Find next available port
  return await findAvailablePort(preferredPort)
}
