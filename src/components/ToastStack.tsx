import React, { useContext } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { ToastContext } from '@/context/toast';
import Icon from './Icon';

const iconByVariant: Record<string, string> = {
	success: 'check-circle-fill',
	danger: 'x-circle-fill',
	warning: 'exclamation-triangle-fill',
	info: 'info-circle-fill',
};

const ToastStack: React.FC = () => {
	const { toasts, removeToast } = useContext(ToastContext);

	if (!toasts.length) return null;

	return (
		<ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
			{toasts.map(toast => (
				<Toast
					key={toast.id}
					bg={toast.variant}
					onClose={() => removeToast(toast.id)}
					autohide
					delay={4000}
				>
					<Toast.Body className="d-flex align-items-center gap-2 text-white">
						<Icon name={iconByVariant[toast.variant]} />
						{toast.message}
					</Toast.Body>
				</Toast>
			))}
		</ToastContainer>
	);
};

export default ToastStack;
