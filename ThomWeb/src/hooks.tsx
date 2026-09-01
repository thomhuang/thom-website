import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const themeStorageKey = 'theme';

function getInitialTheme(): Theme {
    const stored = localStorage.getItem(themeStorageKey);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export function useTheme(): [Theme, () => void] {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.body.dataset.theme = theme;
        localStorage.setItem(themeStorageKey, theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    }

    return [theme, toggleTheme];
}
