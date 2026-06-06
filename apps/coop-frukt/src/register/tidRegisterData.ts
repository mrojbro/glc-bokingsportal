/**
 * Tid register — bundled for all users (no browser storage).
 * To update permanently for everyone, edit `src/data/register-tid.json` and redeploy.
 */
import registerData from '../data/register-tid.json'
import type { TidRegisterEntry } from '../types/tidRegister'

export const TID_REGISTER: TidRegisterEntry[] =
  registerData as TidRegisterEntry[]
