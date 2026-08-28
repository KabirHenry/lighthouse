import { useMemo } from 'react';
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

function MultiSelect<T extends string | number>({
	options,
	value,
	onChange,
	placeholder,
}: {
	options: DropdownOption<T>[];
	value: T[];
	onChange: (value: T[]) => void;
	placeholder?: string;
}) {
	const selected = options.filter((option) => value.includes(option.value));

	const DropdownIndicator = useMemo(() => {
		return function DropdownIndicator(props: DropdownIndicatorProps<DropdownOption<T>, true>) {
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
		return function Option(props: OptionProps<DropdownOption<T>, true>) {
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
		return function Menu(props: MenuProps<DropdownOption<T>, true>) {
			return (
				<components.Menu {...props}>
					<DividerBar />
					{props.children}
				</components.Menu>
			);
		};
	}, []);

	return (
		<Select<DropdownOption<T>, true>
			classNamePrefix="app-dropdown"
			styles={dropdownStyles<T, true>()}
			options={options}
			value={selected}
			onChange={(chosen) => onChange(chosen.map((option) => option.value))}
			placeholder={placeholder}
			isOptionDisabled={(option) => Boolean(option.isDisabled)}
			isSearchable={false}
			isMulti
			closeMenuOnSelect={false}
			hideSelectedOptions={false}
			backspaceRemovesValue={false}
			menuPortalTarget={document.body}
			components={{ DropdownIndicator, Option, Menu }}
		/>
	);
}

export default MultiSelect;
