import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import PageLines from './components/pages/PageLines';
import PageLine from './components/pages/PageLine';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';

function App() {
	return (
		<div className="app">
			<ErrorBoundary>
				<Router>
					<Routes>
						<Route path="/" element={<PageLines />} />
						<Route path="/lines/:name" element={<PageLine />} />
					</Routes>
				</Router>
			</ErrorBoundary>
		</div>
	);
}

export default App;
