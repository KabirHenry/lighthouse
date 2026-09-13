import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Select, {
	components,
	type DropdownIndicatorProps,
	type MenuProps,
	type OptionProps,
} from 'react-select';

import DownArrowIcon from '../../assets/down-arrow.svg';
import UpArrowIcon from '../../assets/up-arrow.svg';
import { DividerBar, dropdownStyles, type DropdownOption } from './dropdownStyles';

import './Modal.css';

/**
 * Value of the "create new…" entry appended to the menu. It can never collide
 * with a real option: every id in the app is a number.
 */
const CREATE = '__create__' as const;

/**
 * Lets the dropdown offer a custom entry alongside the existing options. While
 * `name` is defined the control swaps the menu for a text field holding it, so
 * the caller reads the typed name straight out of its own state.
 */
export type DropdownCreate = {
	// Menu entry that switches the control into create mode, e.g. "Create New Room".
	label: string;
	placeholder: string;
	// Defined when in create mode; the name typed so far.
	name?: string;
	onNameChange: (name: string) => void;
	onStart: () => void;
	// Omit to lock the control in create mode, when there is nothing to fall back to.
	onCancel?: () => void;
	// Whether the field takes focus on entering create mode. Only one field can.
	autoFocus?: boolean;
};

function Dropdown<T extends string | number>({
	options,
	value,
	onChange,
	placeholder,
	create,
}: {
	options: DropdownOption<T>[];
	value: T | undefined;
	onChange: (value: T) => void;
	placeholder?: string;
	create?: DropdownCreate;
}) {
	const { t } = useTranslation();
	const selected = options.find((option) => option.value === value) ?? null;

	const DropdownIndicator = useMemo(() => {
		return function DropdownIndicator(props: DropdownIndicatorProps<DropdownOption<T | typeof CREATE>, false>) {
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
		return function Option(props: OptionProps<DropdownOption<T | typeof CREATE>, false>) {
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
		return function Menu(props: MenuProps<DropdownOption<T | typeof CREATE>, false>) {
			return (
				<components.Menu {...props}>
					<DividerBar />
					{props.children}
				</components.Menu>
			);
		};
	}, []);

	if (create?.name !== undefined) {
		return (
			<div className="app-dropdown-create">
				<input
					type="text"
					value={create.name}
					onChange={(event) => create.onNameChange(event.target.value)}
					placeholder={create.placeholder}
					autoFocus={create.autoFocus}
				/>
				{create.onCancel && (
					<button
						type="button"
						className="app-dropdown-create-cancel"
						onClick={create.onCancel}
						aria-label={t('cancel')}
						title={t('cancel')}
					>
						×
					</button>
				)}
			</div>
		);
	}

	const menuOptions: DropdownOption<T | typeof CREATE>[] = create
		? [...options, { value: CREATE, label: create.label, isCreate: true }]
		: options;

	return (
		<Select<DropdownOption<T | typeof CREATE>>
			classNamePrefix="app-dropdown"
			styles={dropdownStyles<T | typeof CREATE>()}
			options={menuOptions}
			value={selected}
			onChange={(option) => {
				if (!option) {
					return;
				}

				if (option.value === CREATE) {
					create?.onStart();
					return;
				}

				onChange(option.value);
			}}
			placeholder={placeholder}
			isOptionDisabled={(option) => Boolean(option.isDisabled)}
			isSearchable={false}
			menuPortalTarget={document.body}
			components={{ DropdownIndicator, Option, Menu }}
		/>
	);
}

export default Dropdown;
