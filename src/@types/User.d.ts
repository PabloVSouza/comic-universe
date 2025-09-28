interface IUser {
  id?: string
  name: string
  default?: boolean
  settings?: Record<string, any> | null
  ReadProgress?: ReadProgress[]
}
