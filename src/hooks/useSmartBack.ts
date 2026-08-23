import { useNavigate } from 'react-router';

function useSmartBack(fallback: string) {
	const navigate = useNavigate();

	return () => {
		const idx = (window.history.state as { idx?: number } | null)?.idx;
		if (typeof idx === 'number' && idx > 0) {
			navigate(-1);
		} else {
			navigate(fallback);
		}
	};
}

export default useSmartBack;
