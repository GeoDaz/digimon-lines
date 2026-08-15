import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import Icon from '@/components/Icon';
import { SaveMode } from '@/hooks/useSaveLineFlow';

interface Props {
	/** null quand la modale est fermée. */
	mode: SaveMode | null;
	defaultTitle?: string;
	/** Digimon présents dans la ligne : les couvertures possibles. */
	covers: string[];
	defaultCover?: string;
	saving: boolean;
	onClose: () => void;
	onSubmit: (title: string, isPublic: boolean, cover?: string) => void;
}

/**
 * Demande le titre manquant — et, quand elle vient de CTRL+S, la visibilité.
 * Le titre sert aussi de slug : réenregistrer sous le même titre écrase la
 * ligne au lieu d'en créer une copie.
 */
const SaveLineModal: React.FC<Props> = ({
	mode,
	defaultTitle,
	covers,
	defaultCover,
	saving,
	onClose,
	onSubmit,
}) => {
	const [title, setTitle] = useState('');
	const [cover, setCover] = useState<string | undefined>();
	const show = mode !== null;

	// Repart du titre et de la couverture courants à chaque ouverture.
	useEffect(() => {
		if (show) {
			setTitle(defaultTitle || '');
			setCover(defaultCover);
		}
	}, [show, defaultTitle, defaultCover]);

	const trimmed = title.trim();
	const askVisibility = mode === 'ask';

	const submit = (isPublic: boolean) => {
		if (!trimmed || saving) return;
		onSubmit(trimmed, isPublic, cover);
	};

	return (
		<Modal show={show} onHide={onClose} centered>
			<Form
				onSubmit={e => {
					e.preventDefault();
					submit(mode === 'public');
				}}
			>
				<Modal.Header closeButton>
					<Modal.Title>
						{askVisibility ?
							'Save your line'
						: mode === 'public' ?
							'Publish your line'
						:	'Save to your account'}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Group controlId="save-line-title">
						<Form.Label>Line title</Form.Label>
						<Form.Control
							autoFocus
							value={title}
							maxLength={120}
							max={120}
							onChange={e => setTitle(e.target.value)}
						/>
						<Form.Text muted className="mt-2 d-inline-block">
							Saving again under the same title updates the line
						</Form.Text>
					</Form.Group>

					{!!covers.length && (
						<Form.Group className="mt-3">
							<Form.Label>Cover Digimon</Form.Label>
							<div className="d-flex flex-wrap gap-2">
								{covers.map(name => (
									<button
										key={name}
										type="button"
										title={name}
										aria-pressed={cover === name}
										className="cover-option"
										onClick={() => setCover(name)}
									>
										{/* Image brute : hors du contexte de zoom
										    et de licence de LineImage. */}
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={`/images/digimon/${name}.jpg`}
											alt={name}
											width={64}
											height={64}
										/>
									</button>
								))}
							</div>
						</Form.Group>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="link" onClick={onClose} disabled={saving}>
						Cancel
					</Button>
					{askVisibility ?
						<>
							<Button
								variant="outline-primary"
								disabled={!trimmed || saving}
								onClick={() => submit(false)}
							>
								<Icon name="lock" /> Save to my account
							</Button>
							<Button
								variant="primary"
								disabled={!trimmed || saving}
								onClick={() => submit(true)}
							>
								<Icon name="globe" /> Publish
							</Button>
						</>
					:	<Button
							type="submit"
							variant="primary"
							disabled={!trimmed || saving}
						>
							{mode === 'public' ?
								<>
									<Icon name="globe" /> Publish
								</>
							:	<>Save to my account</>}
						</Button>
					}
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default SaveLineModal;
