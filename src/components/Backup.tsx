import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';

import BackRightIcon from '../assets/back-right.svg';
import { IconLink } from './IconLink';
import { titleWithBeacon } from './titleWithBeacon';
import useSmartBack from '../hooks/useSmartBack';
import Button from './Button';
import Modal from './modals/Modal';
import {
	BACKUP_EXTENSION,
	BACKUP_MIME,
	BackupError,
	backupFilename,
	createBackup,
	readBackup,
	restoreBackup,
	type ParsedBackup,
} from '../services/backup';
import { APP_VERSION } from '../constants';

import './Backup.css';

enum StatusKind {
	// Nothing to report.
	IDLE = 'idle',
	// A backup or restore is in flight; the actions are locked out.
	WORKING = 'working',
	// An action finished, with a line to show for it.
	DONE = 'done',
	// An action failed, with a reason to show for it.
	ERROR = 'error',
}

type Status =
	| { kind: StatusKind.IDLE }
	| { kind: StatusKind.WORKING }
	| { kind: StatusKind.DONE; message: string }
	| { kind: StatusKind.ERROR; message: string };

function formatSize(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}

	const units = ['KB', 'MB', 'GB'];
	let size = bytes / 1024;
	let unit = 0;
	while (size >= 1024 && unit < units.length - 1) {
		size /= 1024;
		unit += 1;
	}

	return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[unit]}`;
}

function Backup() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const smartBack = useSmartBack('/');
	const inputRef = useRef<HTMLInputElement>(null);

	const justRestored = searchParams.has('restored');
	const goBack = () => {
		if (justRestored) {
			navigate('/', { replace: true });
			return;
		}

		smartBack();
	};

	const [status, setStatus] = useState<Status>(
		justRestored ? { kind: StatusKind.DONE, message: t('backup.restored') } : { kind: StatusKind.IDLE },
	);
	const [pending, setPending] = useState<ParsedBackup | null>(null);

	const busy = status.kind === StatusKind.WORKING;

	// A BackupError carries a message the user can act on;
	// Anything else is a bug and gets a generic line rather than a stack trace.
	const describe = (error: unknown, fallback: string) =>
		error instanceof BackupError ? error.message : fallback;

	const handleDownload = async () => {
		setStatus({ kind: StatusKind.WORKING });

		try {
			const blob = await createBackup(APP_VERSION);
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = backupFilename();
			document.body.appendChild(link);
			link.click();
			link.remove();
			// Safari needs the URL to outlive the click before it is revoked.
			setTimeout(() => URL.revokeObjectURL(url), 60_000);

			setStatus({ kind: StatusKind.DONE, message: t('backup.downloaded', { size: formatSize(blob.size) }) });
		} catch (error) {
			setStatus({ kind: StatusKind.ERROR, message: describe(error, t('backup.downloadFailed')) });
		}
	};

	const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		// Clear it so picking the same file twice still fires a change event.
		event.target.value = '';

		if (!file) {
			return;
		}

		setStatus({ kind: StatusKind.WORKING });

		try {
			const parsed = await readBackup(file);
			setPending(parsed);
			setStatus({ kind: StatusKind.IDLE });
		} catch (error) {
			setStatus({ kind: StatusKind.ERROR, message: describe(error, t('backup.unreadable')) });
		}
	};

	const handleRestore = async () => {
		if (!pending) {
			return;
		}

		setPending(null);
		setStatus({ kind: StatusKind.WORKING });

		try {
			await restoreBackup(pending);
			window.location.replace(`${window.location.pathname}?restored=${Date.now()}`);
		} catch (error) {
			setStatus({ kind: StatusKind.ERROR, message: describe(error, t('backup.restoreFailed')) });
		}
	};

	const total = pending
		? Object.values(pending.summary.counts).reduce((sum, count) => sum + count, 0)
		: 0;

	return <>
		<div className="align-self-end">
			<IconLink onClick={goBack} src={BackRightIcon} alt={t('home.back')} className='bare' />
		</div>
		<h1>{titleWithBeacon(t('home.title'))}</h1>
		<div className="backup d-flex flex-column align-items-center">
			<p className="backup-description">{t('backup.description')}</p>

			<div className="backup-actions d-flex flex-column align-items-center">
				<Button onClick={handleDownload} disabled={busy}>
					{busy ? t('backup.working') : t('backup.download')}
				</Button>
				<Button onClick={() => inputRef.current?.click()} disabled={busy}>
					{t('backup.restore')}
				</Button>
				{/*
				  * The MIME type rides along with the extension because iOS maps an
				  * unknown extension to no UTI at all, which greys out every file in
				  * the picker. Whatever comes back is validated by its magic bytes.
				  */}
				<input
					ref={inputRef}
					type="file"
					accept={`${BACKUP_EXTENSION},${BACKUP_MIME}`}
					className="backup-input"
					onChange={handleFile}
				/>
			</div>

			{status.kind === StatusKind.DONE && <p className="backup-status">{status.message}</p>}
			{status.kind === StatusKind.ERROR && <p className="backup-status error">{status.message}</p>}
		</div>

		{pending && (
			<Modal onClose={() => setPending(null)}>
				<div className='d-flex flex-column align-items-center gap-0'>
					<h2>{t('areYouSure')}</h2>
					<div className='sheet'>
						⚠️ {t('backup.restoreConfirm')}
					</div>
					<div className="modal-hint">
						{t('backup.fileSummary', {
							date: pending.summary.createdAt.toLocaleString(),
							records: total,
							pictures: pending.summary.pictureCount,
						})}
					</div>
					<div className="app-modal-footer d-flex flex-row justify-content-between w-100">
						<Button className='confirm' onClick={handleRestore}>{t('confirm')}</Button>
						<Button type='button' className='cancel' onClick={() => setPending(null)}>
							{t('cancel')}
						</Button>
					</div>
				</div>
			</Modal>
		)}
	</>;
}

export default Backup;
