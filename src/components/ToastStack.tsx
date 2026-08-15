import React, { useContext } from 'react';
import Link from 'next/link';
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
		<ToastContainer
			position="bottom-end"
			containerPosition="fixed"
			className="p-3"
			style={{ zIndex: 9999 }}
		>
			{toasts.map(toast => {
				const body = (
					<Toast.Body className="d-flex align-items-center gap-2 text-white">
						<Icon name={iconByVariant[toast.variant]} />
						{toast.message}
						{!!toast.href && <Icon name="box-arrow-up-right" className="ms-1" />}
					</Toast.Body>
				);
				return (
					<Toast
						key={toast.id}
						bg={toast.variant}
						onClose={() => removeToast(toast.id)}
						autohide
						delay={toast.href ? 8000 : 4000}
					>
						{toast.href ?
							// Le lien porte le corps du toast, pas le toast entier :
							// la croix de fermeture doit rester cliquable pour elle-même.
							<Link
								href={toast.href}
								className="text-white text-decoration-none"
								onClick={() => removeToast(toast.id)}
							>
								{body}
							</Link>
						:	body}
					</Toast>
				);
			})}
		</ToastContainer>
	);
};

export default ToastStack;
