import { useTheme, type ThemeName } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

const THEMES: { value: ThemeName; label: string }[] = [
  { value: 'aurora', label: 'Aurora' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'forest', label: 'Forest' },
];

export function ThemeSelector() {
  const { themeName, setThemeName } = useTheme();

  return (
    <div className="flex items-center gap-1">
      <Palette className="w-4 h-4 text-muted-foreground" />
      <div className="hidden sm:flex gap-1">
        {THEMES.map((theme) => (
          <Button
            key={theme.value}
            variant={themeName === theme.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setThemeName(theme.value)}
            className="text-xs"
          >
            {theme.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
