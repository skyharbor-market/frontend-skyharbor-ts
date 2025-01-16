import { useState, useEffect } from 'react';

export const useThemeDetector = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('light');

  useEffect(() => {
    // Get initial theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);

    // Create a MutationObserver to watch for theme changes in the HTML element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const htmlElement = document.documentElement;
          const isDark = htmlElement.classList.contains('dark');
          setCurrentTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    // Start observing the HTML element for class changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return currentTheme;
}; 