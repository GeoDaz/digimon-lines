import React, { createContext, useCallback, useContext, useState } from 'react';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
	id: number;
	message: string;
	variant: ToastVariant;
}

interface ToastContextValue {
	toasts: ToastMessage[];
	addToast: (message: string, variant?: ToastVariant) => void;
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
		(message: string, variant: ToastVariant = 'success') => {
			const id = nextId++;
			setToasts(prev => [...prev, { id, message, variant }]);
			setTimeout(() => removeToast(id), 4000);
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
