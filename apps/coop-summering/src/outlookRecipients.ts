/** Outlook To-recipients for Coop Summering mail. */
export const OUTLOOK_RECIPIENTS = [
  'lager@glc.se',
  'coopterminal.glc@glc.se',
  'bojan.lukic@glc.se',
  'peter.johansson@glc.se',
  'sime.buric@glc.se',
  'simon.wideryd@glc.se',
  'marcus.heneborn@glc.se',
  'bosse.larsson@glc.se',
  'catlin.sandersnas@glc.se',
  'susanne.utriainen@glcse.onmicrosoft.com',
  'antonio.lucik@glc.se',
  'drilon.mulaku@glc.se',
  'distribution.glc@glc.se',
  'luigi.johannesson@glc.se',
  'elinor.rosenback@glc.se',
  'stefan.abrahamsson@glc.se',
  'martin.rojbro@glc.se',
] as const

export type OutlookRecipient = (typeof OUTLOOK_RECIPIENTS)[number]

/** Semicolon-separated list for modern Outlook / systems that accept multiple. */
export function allRecipientsClipboardText(): string {
  return OUTLOOK_RECIPIENTS.join('; ')
}
