interface IUser {
  id?: string
  name: string
  default?: boolean
  settings?: Record<string, any> | null
  websiteAuthToken?: string | null
  websiteAuthExpiresAt?: string | null
  websiteAuthDeviceName?: string | null
  websiteUserId?: string | null
  ReadProgress?: ReadProgress[]
}
