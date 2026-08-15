import React, { createContext, useCallback, useContext, useState } from 'react';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
	id: number;
	message: string;
	variant: ToastVariant;
	/** Rend le toast cliquable : il mène à cette page. */
	href?: string;
}

interface ToastContextValue {
	toasts: ToastMessage[];
	addToast: (message: string, variant?: ToastVariant, href?: string) => void;
	removeToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue>({
	toasts: [],
	addToast: () => {},
	removeToast: () => {},
});

let nextId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const removeToast = useCallback((id: number) => {
		setToasts(prev => prev.filter(t => t.id !== id));
	}, []);

	const addToast = useCallback(
		(message: string, variant: ToastVariant = 'success', href?: string) => {
			const id = nextId++;
			setToasts(prev => [...prev, { id, message, variant, href }]);
			// Un toast cliquable laisse le temps de le viser.
			setTimeout(() => removeToast(id), href ? 8000 : 4000);
		},
		[removeToast]
	);

	return (
		<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
			{children}
		</ToastContext.Provider>
	);
};

export const useToast = () => useContext(ToastContext);
