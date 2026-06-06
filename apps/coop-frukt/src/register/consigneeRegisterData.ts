/**
 * Consignee register — bundled for all users (no browser storage).
 * To update permanently for everyone, edit `src/data/register.json` and redeploy.
 */
import registerData from '../data/register.json'
import type { RegisterEntry } from '../types/register'

export const CONSIGNEE_REGISTER: RegisterEntry[] = registerData as RegisterEntry[]
