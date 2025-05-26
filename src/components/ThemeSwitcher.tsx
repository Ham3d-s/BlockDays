import React, { useEffect, useState } from 'react';

// Themes for the switcher. IDs must match theme names in tailwind.config.js
const themes = [
  { name: 'پیش‌فرض روشن', id: 'light' },     // Corresponds to custom 'light' in config
  { name: 'پیش‌فرض تیره', id: 'night' },     // Corresponds to custom 'night' in config
  { name: 'کاپ کیک', id: 'cupcake' },
  { name: 'سینث‌ویو', id: 'synthwave' },
  { name: 'رترو', id: 'retro' },
  { name: 'دراکولا', id: 'dracula' },
];

const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && themes.some(t => t.id === savedTheme)) { // Ensure saved theme is valid
        return savedTheme;
      }
      // Check for system preference if no theme is saved or saved theme is invalid
      // Our custom dark theme is 'night', so we map system dark preference to 'night'
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'night'; 
      }
    }
    return 'light'; // Default theme (our custom 'light')
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentTheme(event.target.value);
  };

  return (
    <div className="form-control">
      <label htmlFor="theme-select" className="label sr-only">
        <span className="label-text">انتخاب پوسته</span>
      </label>
      <select
        id="theme-select"
        className="select select-bordered select-sm"
        value={currentTheme}
        onChange={handleThemeChange}
        aria-label="Select Theme"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
