import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          dark: "hsl(var(--primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          light: "hsl(var(--accent-light))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        earth: {
          DEFAULT: "hsl(var(--earth))",
          foreground: "hsl(var(--earth-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
        },
        cream: {
          DEFAULT: "hsl(var(--cream))",
          foreground: "hsl(var(--cream-foreground))",
        },
        voice: {
          active: "hsl(var(--voice-active))",
          recording: "hsl(var(--voice-recording))",
          success: "hsl(var(--voice-success))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        '2xl': "calc(var(--radius) + 8px)",
        '3xl': "calc(var(--radius) + 16px)",
      },
      backgroundImage: {
        'peace-gradient': 'var(--peace-gradient)',
        'community-gradient': 'var(--community-gradient)',
        'story-gradient': 'var(--story-gradient)',
        'hero-gradient': 'var(--hero-gradient)',
        'sunset-gradient': 'var(--sunset-gradient)',
        'cyber-gradient': 'var(--cyber-gradient)',
      },
      boxShadow: {
        'peace': 'var(--shadow-peace)',
        'warm': 'var(--shadow-warm)',
        'story': 'var(--shadow-story)',
        'elevated': 'var(--shadow-elevated)',
        'glow': 'var(--shadow-glow)',
        'neon': '0 0 5px theme(colors.primary.DEFAULT), 0 0 20px theme(colors.primary.DEFAULT)',
        'neon-accent': '0 0 5px theme(colors.accent.DEFAULT), 0 0 20px theme(colors.accent.DEFAULT)',
        'neon-gold': '0 0 5px theme(colors.gold.DEFAULT), 0 0 20px theme(colors.gold.DEFAULT)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.005em' }],
        'base': ['1rem', { lineHeight: '1.7', letterSpacing: '-0.005em' }],
        'lg': ['1.125rem', { lineHeight: '1.65', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.015em' }],
        '2xl': ['1.5rem', { lineHeight: '1.35', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.035em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        '7xl': ['4.5rem', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-voice": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "pulse-recording": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-voice": "pulse-voice 2s infinite",
        "pulse-recording": "pulse-recording 1s infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "glow": "glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
