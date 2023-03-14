import React, { Component } from 'react';
import PageError from './PageError';

interface Props {
	children: React.ReactNode;
}
interface State {
	hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };

		this.clearError = this.clearError.bind(this);
	}

	static getDerivedStateFromError(error: any) {
		// Mettez à jour l'état, de façon à montrer l'UI de repli au prochain rendu.
		return { hasError: true };
	}

	componentDidCatch(error: any, errorInfo: any) {
		// Vous pouvez aussi enregistrer l'erreur au sein d'un service de rapport.
	}

	clearError() {
		this.setState({ hasError: false });
	}

	render() {
		if (this.state.hasError) {
			// UI de repli.
			return <PageError clearError={this.clearError} />;
		}

		return this.props.children;
	}
}
export default ErrorBoundary;
