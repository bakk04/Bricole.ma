"use client"

import * as React from "react"

// ================= TYPES =================
export interface ToastProps {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
}

export type ToastActionElement = React.ReactNode

// ================= CONTEXT =================
type ToastContextType = {
    toasts: ToastProps[]
    addToast: (toast: Omit<ToastProps, "id">) => void
    removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

// ================= PROVIDER =================
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = React.useState<ToastProps[]>([])

    const addToast = (toast: Omit<ToastProps, "id">) => {
        const id = crypto.randomUUID()

        setToasts((prev) => [...prev, { ...toast, id }])

        // Auto remove (PWA friendly)
        setTimeout(() => {
            removeToast(id)
        }, 4000)
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

// ================= HOOK =================
export const useToast = () => {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within ToastProvider")
    }
    return context
}

// ================= UI =================
const ToastContainer = ({
                            toasts,
                            removeToast,
                        }: {
    toasts: ToastProps[]
    removeToast: (id: string) => void
}) => {
    return (
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="bg-white shadow-lg rounded-xl p-4 w-80 border animate-in fade-in slide-in-from-top-2"
                >
                    {toast.title && (
                        <h4 className="font-semibold text-gray-900">{toast.title}</h4>
                    )}
                    {toast.description && (
                        <p className="text-sm text-gray-600">{toast.description}</p>
                    )}

                    {toast.action && <div className="mt-2">{toast.action}</div>}

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-black"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    )
}