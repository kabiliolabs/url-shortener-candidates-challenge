import { useState, useCallback } from "react"

export function useCopy(timeoutMs = 1800) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), timeoutMs)
      } catch {
        // Fallback for older browsers
        const area = document.createElement("textarea")
        area.value = text
        area.style.position = "fixed"
        area.style.opacity = "0"
        document.body.appendChild(area)
        area.select()
        document.execCommand("copy")
        document.body.removeChild(area)
        setCopied(true)
        setTimeout(() => setCopied(false), timeoutMs)
      }
    },
    [timeoutMs],
  )

  return { copy, copied }
}
