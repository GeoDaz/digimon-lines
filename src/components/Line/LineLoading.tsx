import React from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';

const LineLoading: React.FC = () => (
	<div className="line-wrapper">
		<Row className="line-row">
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
		</Row>
		<Row className="line-row">
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
		</Row>
		<Row className="line-row">
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
		</Row>
		<Row className="line-row">
			<Col>
				<div className="line-point">
					<Spinner animation="border" />
				</div>
			</Col>
		</Row>
	</div>
);
export default LineLoading;
