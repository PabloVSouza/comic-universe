interface IUser {
  id?: number
  name: string
  default?: boolean
  settings?: Record<string, any> | null
  ReadProgress?: ReadProgress[]
}
