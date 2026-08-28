import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';

import useHomesContext from '../../hooks/useHomesContext';
import useSmartBack from '../../hooks/useSmartBack';
import type { PictureID, PictureOwnerType } from '../../services';
import Button from '../Button';
import CameraIcon from '../CameraIcon';
import Modal from './Modal';

import './PictureModal.css';

function extFromMime(mime: string | null): string {
	if (mime === 'image/jpeg') {
		return 'jpg';
	}

	const subtype = mime?.split('/')[1];
	return subtype && /^[a-z0-9]+$/i.test(subtype) ? subtype.toLowerCase() : 'png';
}

function PictureModal({ type }: { type: PictureOwnerType }) {
	const { t } = useTranslation();
	const { rooms, locations, allItems, getPicture, updatePicture } = useHomesContext();
	const { id } = useParams<{ id: string }>();
	const [searchParams] = useSearchParams();

	const entity = (() => {
		const numericID = Number(id);
		switch (type) {
		case 'room':
			return rooms.find((info) => info.room.id === numericID)?.room;
		case 'location':
			return locations.find((info) => info.location.id === numericID)?.location;
		case 'item':
			return allItems.find((info) => info.item.id === numericID)?.item;
		}
	})();

	const name = entity?.name ?? '';
	const pictureID = entity?.pictureID;

	const search = searchParams.toString();
	const fallback = (() => {
		switch (type) {
		case 'room':
			return '/rooms';
		case 'location': {
			const roomID = (entity && 'roomID' in entity ? entity.roomID : undefined)
					?? searchParams.get('room');
			return `/locations?room=${roomID}`;
		}
		case 'item':
			return search ? `/items?${search}` : '/items';
		}
	})();
	const close = useSmartBack(fallback);

	const [existing, setExisting] = useState<{ url: string; mimeType: string } | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [cleared, setCleared] = useState(false);
	const [dragging, setDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (pictureID === undefined) {
			return;
		}

		let cancelled = false;
		let url: string | null = null;

		void getPicture(pictureID as PictureID).then((picture) => {
			if (cancelled || !picture) {
				return;
			}

			url = URL.createObjectURL(picture.data);
			setExisting({ url, mimeType: picture.mimeType });
		});

		return () => {
			cancelled = true;
			if (url) {
				URL.revokeObjectURL(url);
			}
			setExisting(null);
		};
	}, [pictureID, getPicture]);

	const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

	useEffect(() => () => {
		if (fileUrl) {
			URL.revokeObjectURL(fileUrl);
		}
	}, [fileUrl]);

	const shownUrl = fileUrl ?? (cleared ? null : existing?.url ?? null);
	const shownMime = file?.type ?? (cleared ? null : existing?.mimeType ?? null);
	const hasPendingChange = file !== null || (cleared && pictureID !== undefined);
	// Enabled when there is a picture to act on: a freshly picked file, or the
	// entity's saved picture that has not been cleared this session.
	const canClear = file !== null || (!cleared && pictureID !== undefined);

	const acceptFile = (candidate: File | null | undefined) => {
		if (candidate && candidate.type.startsWith('image/')) {
			setFile(candidate);
			setCleared(false);
		}
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setDragging(false);
		acceptFile(event.dataTransfer.files[0]);
	};

	const handleClear = () => {
		setFile(null);
		setCleared(true);
	};

	const handleUpdate = async () => {
		if (!entity || !hasPendingChange) {
			return;
		}

		await updatePicture(type, entity.id, file ? { mimeType: file.type, data: file } : null);
		close();
	};

	const handleDownload = () => {
		if (!shownUrl) {
			return;
		}

		const link = document.createElement('a');
		link.href = shownUrl;
		link.download = `${name || type}.${extFromMime(shownMime)}`;
		document.body.appendChild(link);
		link.click();
		link.remove();
	};

	return (
		<Modal onClose={close}>
			<div className='d-flex flex-column align-items-center gap-0'>
				<h2>{t(`${type}s.picture`)}</h2>
				<div className='picture-label'>{t('picture.prompt', { name })}</div>
				<div
					className={['picture-drop', shownUrl ? 'has-image' : '', dragging ? 'dragging' : '']
						.filter(Boolean).join(' ')}
					onClick={() => inputRef.current?.click()}
					onDragOver={(event) => {
						event.preventDefault();
						setDragging(true);
					}}
					onDragEnter={(event) => {
						event.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={handleDrop}
				>
					{shownUrl ? (
						<div className='picture-drop-figure'>
							<img src={shownUrl} alt={name} />
							<div className='picture-drop-overlay'>
								<CameraIcon />
							</div>
						</div>
					) : (
						<div className='picture-drop-empty'>
							<CameraIcon />
						</div>
					)}
				</div>
				<input
					ref={inputRef}
					className='picture-input'
					type='file'
					accept='image/*'
					onChange={(event) => {
						acceptFile(event.target.files?.[0]);
						event.target.value = '';
					}}
				/>
				<div className='app-modal-footer d-flex flex-column w-100'>
					<div className='d-flex flex-row justify-content-between w-100'>
						<Button type='button' className='muted' disabled={!canClear} onClick={handleClear}>
							{t('clear')}
						</Button>
						<Button type='button' className='muted' disabled={!canClear} onClick={handleDownload}>
							{t('picture.download')}
						</Button>
					</div>
					<div className='d-flex flex-row justify-content-between w-100'>
						<Button type='button' className='confirm' disabled={!hasPendingChange} onClick={handleUpdate}>
							{t('picture.update')}
						</Button>
						<Button type='button' className='cancel' onClick={close}>
							{t('cancel')}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default PictureModal;
