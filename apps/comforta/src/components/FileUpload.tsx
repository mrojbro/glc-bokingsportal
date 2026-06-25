import { useCallback, useRef, useState } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
  fileName?: string | null
}

const ACCEPTED = new Set(['csv', 'xlsx', 'xls'])

export function FileUpload({ onFileSelect, isLoading, fileName }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!ext || !ACCEPTED.has(ext)) return
      onFileSelect(file)
    },
    [onFileSelect],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFile(e.dataTransfer.files[0])
    },
    [handleFile],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={[
        'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors',
        dragOver
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[#484f58]',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-dim)] text-2xl">
        📊
      </div>
      <p className="text-lg font-medium text-[var(--color-text)]">
        {isLoading ? 'Läser in fil…' : 'Släpp Excel/CSV här eller klicka för att välja'}
      </p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Kolumn 1 = mottagarnamn, kolumn 2 = tal
      </p>
      {fileName && (
        <p className="mt-3 text-sm font-medium text-[var(--color-accent)]">{fileName}</p>
      )}
    </div>
  )
}
