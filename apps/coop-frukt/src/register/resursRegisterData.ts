/**
 * Resurs register — bundled for all users (no browser storage).
 * To update permanently for everyone, edit `src/data/register-resurs.json` and redeploy.
 */
import registerData from '../data/register-resurs.json'
import type { ResursRegisterEntry } from '../types/resursRegister'

export const RESURS_REGISTER: ResursRegisterEntry[] =
  registerData as ResursRegisterEntry[]
