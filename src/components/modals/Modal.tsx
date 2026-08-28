import type React from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import './Modal.css';

function Modal({
	onClose,
	children,
}: {
	onClose?: () => void;
	children: React.ReactNode;
}) {
	useEffect(() => {
		if (!onClose) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			// Skip if a nested control (e.g. an open dropdown menu) already handled
			// the key press, so Escape closes that first rather than the modal.
			if (event.key === 'Escape' && !event.defaultPrevented) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	return createPortal(
		<div className="app-modal-backdrop" onClick={onClose}>
			<div className="app-modal" onClick={(event) => event.stopPropagation()}>
				{children}
			</div>
		</div>,
		document.body,
	);
}

export default Modal;
