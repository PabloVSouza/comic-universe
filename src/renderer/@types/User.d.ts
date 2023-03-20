interface User {
  name: string
  _id: string
  createdAt: {
    $$date: number
  }
}
