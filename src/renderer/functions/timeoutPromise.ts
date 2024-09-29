export default <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Request timed out')), ms)
    promise
      .then((res) => {
        clearTimeout(timeout)
        resolve(res)
      })
      .catch((err) => {
        clearTimeout(timeout)
        reject(err)
      })
  })
}
