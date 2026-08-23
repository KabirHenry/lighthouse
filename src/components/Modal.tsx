import type React from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

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
			if (event.key === 'Escape') {
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
