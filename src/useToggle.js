import { useState } from 'react';

function useToggle(initial = false) {
    const [value, setter] = useState(Boolean(initial));
    const toggle = () => setter(v => !v);
    return [value, toggle];
}

export default useToggle;