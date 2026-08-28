import { useMemo } from 'react';
import Select, {
	components,
	type DropdownIndicatorProps,
	type MenuProps,
	type OptionProps,
	type StylesConfig,
} from 'react-select';

import DownArrowIcon from '../../assets/down-arrow.svg';
import UpArrowIcon from '../../assets/up-arrow.svg';

import './Modal.css';

export type DropdownOption<T> = {
	value: T;
	label: string;
};

function DividerBar() {
	return <div style={{ height: 4, background: 'var(--colour-modal-dropdown-divider)' }} />;
}

function dropdownStyles<T>(): StylesConfig<DropdownOption<T>, false> {
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
				: props.isFocused
					? 'rgba(0, 0, 0, 0.08)'
					: 'transparent',
			color: 'var(--colour-modal-text)',
			cursor: 'pointer',
		}),
	};
}

function Dropdown<T extends string | number>({
	options,
	value,
	onChange,
	placeholder,
}: {
	options: DropdownOption<T>[];
	value: T | undefined;
	onChange: (value: T) => void;
	placeholder?: string;
}) {
	const selected = options.find((option) => option.value === value) ?? null;

	const DropdownIndicator = useMemo(() => {
		return function DropdownIndicator(props: DropdownIndicatorProps<DropdownOption<T>, false>) {
			return (
				<components.DropdownIndicator {...props}>
					<img
						src={props.selectProps.menuIsOpen ? UpArrowIcon : DownArrowIcon}
						alt=""
						style={{ width: 16, height: 16, marginRight: 8 }}
					/>
				</components.DropdownIndicator>
			);
		};
	}, []);

	const Option = useMemo(() => {
		return function Option(props: OptionProps<DropdownOption<T>, false>) {
			const isLast = props.selectProps.options[props.selectProps.options.length - 1] === props.data;

			return (
				<>
					<components.Option {...props} />
					{!isLast && <DividerBar />}
				</>
			);
		};
	}, []);

	const Menu = useMemo(() => {
		return function Menu(props: MenuProps<DropdownOption<T>, false>) {
			return (
				<components.Menu {...props}>
					<DividerBar />
					{props.children}
				</components.Menu>
			);
		};
	}, []);

	return (
		<Select<DropdownOption<T>>
			classNamePrefix="app-dropdown"
			styles={dropdownStyles<T>()}
			options={options}
			value={selected}
			onChange={(option) => {
				if (option) {
					onChange(option.value);
				}
			}}
			placeholder={placeholder}
			isSearchable={false}
			menuPortalTarget={document.body}
			components={{ DropdownIndicator, Option, Menu }}
		/>
	);
}

export default Dropdown;
