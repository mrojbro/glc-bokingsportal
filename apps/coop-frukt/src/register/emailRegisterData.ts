/**
 * Mejladress-register — bundled for all users (no browser storage).
 * To update permanently for everyone, edit `src/data/register-mejl.json` and redeploy.
 */
import registerData from '../data/register-mejl.json'
import { activeEmailAddresses } from './emailRegister'

function normalizeRegisterData(data: unknown): string[] {
  if (!Array.isArray(data)) return []

  return activeEmailAddresses(
    data.map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object' && 'address' in item) {
        return String((item as { address: unknown }).address ?? '')
      }
      return ''
    }),
  )
}

export const EMAIL_REGISTER: string[] = normalizeRegisterData(registerData)
