'use client'

import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastState {
  toasts: Toast[]
}

let toastCount = 0

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = String(toastCount++)
    
    setState((prev) => ({
      toasts: [...prev.toasts, { id, title, description, variant }]
    }))

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setState((prev) => ({
        toasts: prev.toasts.filter((t) => t.id !== id)
      }))
    }, 3000)

    // Also show as alert for now (simple implementation)
    if (typeof window !== 'undefined') {
      const message = description ? `${title}\n${description}` : title
      if (variant === 'destructive') {
        console.error(message)
      } else {
        console.log(message)
      }
    }
  }, [])

  return {
    toast,
    toasts: state.toasts,
  }
}
