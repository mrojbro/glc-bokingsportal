import { useMemo } from 'react'
import { tokenizeJson } from './tokenizeJson'

export function HighlightedJson({ text }: { text: string }) {
  const tokens = useMemo(() => tokenizeJson(text), [text])

  return (
    <pre className="json-highlight max-h-[70vh] overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm whitespace-pre">
      {tokens.map((token, index) =>
        token.type === 'space' ? (
          token.value
        ) : (
          <span key={index} className={`json-${token.type}`}>
            {token.value}
          </span>
        ),
      )}
    </pre>
  )
}
