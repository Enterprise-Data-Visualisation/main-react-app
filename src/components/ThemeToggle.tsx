import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-lg"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Sun className="h-4 w-4 text-amber-500 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-blue-400 transition-transform hover:rotate-45" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
