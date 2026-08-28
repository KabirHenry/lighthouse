/* eslint-disable react-refresh/only-export-components */
import type { StylesConfig } from 'react-select';

import './Modal.css';

export type DropdownOption<T> = {
	value: T;
	label: string;
	isDisabled?: boolean;
};

export function DividerBar() {
	return <div style={{ height: 4, background: 'var(--colour-modal-dropdown-divider)' }} />;
}

export function dropdownStyles<T, IsMulti extends boolean = false>(): StylesConfig<DropdownOption<T>, IsMulti> {
	return {
		control: (base, state) => ({
			...base,
			minHeight: 'unset',
			border: 'none',
			outline: 'none',
			borderRadius: state.menuIsOpen ? '20px 20px 0 0' : 20,
			background: 'var(--colour-modal-input-background)',
			boxShadow: state.menuIsOpen ? 'none' : '0 8px 12px -6px var(--colour-modal-sheet-drop-shadow)',
			cursor: 'pointer',
		}),
		valueContainer: (base) => ({
			...base,
			padding: '10px 35px',
			justifyContent: 'center',
		}),
		singleValue: (base) => ({
			...base,
			margin: 0,
			color: 'var(--colour-modal-text)',
		}),
		input: (base) => ({
			...base,
			margin: 0,
			padding: 0,
			color: 'var(--colour-modal-text)',
		}),
		placeholder: (base) => ({
			...base,
			color: 'var(--colour-modal-text)',
			opacity: 0.6,
		}),
		multiValue: (base) => ({
			...base,
			borderRadius: 12,
			background: 'var(--colour-modal-dropdown-divider)',
		}),
		multiValueLabel: (base) => ({
			...base,
			padding: '2px 6px',
			fontSize: '18px',
			color: 'var(--colour-modal-text)',
		}),
		multiValueRemove: (base) => ({
			...base,
			borderRadius: 12,
			color: 'var(--colour-modal-text)',
			':hover': { background: 'rgba(0, 0, 0, 0.1)', color: 'var(--colour-modal-text)' },
		}),
		indicatorSeparator: () => ({ display: 'none' }),
		dropdownIndicator: (base) => ({
			...base,
			color: 'var(--colour-modal-text)',
			padding: '0 12px 0 0',
		}),
		menuPortal: (base) => ({
			...base,
			zIndex: 9999,
		}),
		menu: (base) => ({
			...base,
			marginTop: 0,
			borderRadius: '0 0 20px 20px',
			overflow: 'hidden',
			background: 'var(--colour-modal-input-background)',
			boxShadow: '0 8px 12px -6px var(--colour-modal-sheet-drop-shadow)',
			// The menu is portalled to <body>, so it no longer inherits .app-modal's
			// font-size, therefore we set it explicitly here.
			fontSize: '26px',
		}),
		menuList: (base) => ({
			...base,
			padding: 0,
		}),
		option: (base, props) => ({
			...base,
			paddingTop: 12,
			paddingBottom: 12,
			background: props.isSelected
				? 'rgba(0, 0, 0, 0.05)'
				: props.isFocused && !props.isDisabled
					? 'rgba(0, 0, 0, 0.08)'
					: 'transparent',
			color: 'var(--colour-modal-text)',
			opacity: props.isDisabled ? 0.4 : 1,
			cursor: props.isDisabled ? 'not-allowed' : 'pointer',
		}),
	};
}
