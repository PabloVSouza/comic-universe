const capitalize = (input: string): string => {
  const letters = input.split('')
  const uppercaseFirstLetter = letters[0].toUpperCase()
  const finalString = letters.splice(1).reduce((acc, cur) => {
    return acc + cur
  }, uppercaseFirstLetter)

  return finalString
}

export default capitalize
