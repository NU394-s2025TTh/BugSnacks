/*
 * ModeToggle component:
 * - Imports icon components (Sun, Moon) to visually represent theme state.
 * - Uses a custom hook (useTheme) to retrieve and update the current theme.
 * - Renders a button that toggles between 'light' and 'dark' themes on click.
 * - Displays the appropriate icon based on the active theme.
 */
// All comments made in the file were done by OpenAI's o4-mini model

// Import Sun and Moon icons to represent light and dark modes
import { Moon, Sun } from 'lucide-react';

// Import custom theme hook for accessing and setting theme state
import { useTheme } from '@/components/theme-provider';
// Import Button UI component for the toggle control
import { Button } from '@/components/ui/button';

// Define and export the ModeToggle component
export function ModeToggle() {
  // Destructure current theme value and setter function from context
  const { theme, setTheme } = useTheme();

  // Handler to switch theme between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Render button with click handler and icon based on current theme
  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? (
        // Show Sun icon when in dark mode (to indicate switch to light)
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        // Show Moon icon when in light mode (to indicate switch to dark)
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}
