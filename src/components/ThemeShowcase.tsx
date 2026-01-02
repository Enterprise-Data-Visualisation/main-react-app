import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ThemeShowcase() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Theme Color Palette</h2>
        <p className="text-muted-foreground mb-6">
          Aurora Theme - Modern Blue & Purple with perfect dark mode support
        </p>
      </div>

      {/* Base Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Base Colors</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ColorSwatch name="Background" className="bg-background" />
          <ColorSwatch name="Foreground" className="bg-foreground" />
          <ColorSwatch name="Card" className="bg-card border-2 border-border" />
          <ColorSwatch name="Muted" className="bg-muted" />
        </div>
      </div>

      {/* Primary & Secondary */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Action Colors</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <ColorSwatch name="Primary" className="bg-primary" />
          <ColorSwatch name="Secondary" className="bg-secondary" />
          <ColorSwatch name="Accent" className="bg-accent" />
        </div>
      </div>

      {/* State Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Status Colors</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          <ColorSwatch name="Destructive" className="bg-destructive" />
          <ColorSwatch name="Ring (Focus)" className="bg-ring" />
        </div>
      </div>

      {/* Chart Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Chart Colors</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <ColorSwatch name="Chart 1" className="bg-chart-1" />
          <ColorSwatch name="Chart 2" className="bg-chart-2" />
          <ColorSwatch name="Chart 3" className="bg-chart-3" />
          <ColorSwatch name="Chart 4" className="bg-chart-4" />
          <ColorSwatch name="Chart 5" className="bg-chart-5" />
        </div>
      </div>

      {/* Component Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Component Preview</h3>
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>This shows how components look with the theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm font-medium">
                Primary Button
              </button>
              <button className="px-3 py-1 rounded bg-secondary text-secondary-foreground text-sm font-medium">
                Secondary Button
              </button>
              <button className="px-3 py-1 rounded bg-accent text-accent-foreground text-sm font-medium">
                Accent Button
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Muted text color for secondary information
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Theme Variables Guide */}
      <div>
        <h3 className="text-lg font-semibold mb-4">How the Theme Works ✨</h3>
        <Card className="bg-muted/30">
          <CardContent className="pt-6 space-y-3 text-sm">
            <div>
              <strong className="text-primary">CSS Variables:</strong>
              <p className="text-muted-foreground">
                All colors are defined as CSS custom properties (--primary, --background, etc.)
              </p>
            </div>
            <div>
              <strong className="text-secondary">Light & Dark Modes:</strong>
              <p className="text-muted-foreground">
                The same variables switch values in :root and .dark selectors
              </p>
            </div>
            <div>
              <strong className="text-accent">Tailwind Integration:</strong>
              <p className="text-muted-foreground">
                Use classes like bg-primary, text-foreground, border-border directly
              </p>
            </div>
            <div>
              <strong className="text-chart-1">Shadcn Components:</strong>
              <p className="text-muted-foreground">
                All shadcn/ui components automatically use your theme colors
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ColorSwatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`h-20 rounded-lg border border-border ${className}`} />
      <p className="text-xs font-medium text-muted-foreground">{name}</p>
    </div>
  );
}
