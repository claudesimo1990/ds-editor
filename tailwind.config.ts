import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Memorial Color Palette
				memorial: {
					black: 'hsl(var(--memorial-black))',
					charcoal: 'hsl(var(--memorial-charcoal))',
					darkGrey: 'hsl(var(--memorial-dark-grey))',
					grey: 'hsl(var(--memorial-grey))',
					lightGrey: 'hsl(var(--memorial-light-grey))',
					silver: 'hsl(var(--memorial-silver))',
					platinum: 'hsl(var(--memorial-platinum))',
					snow: 'hsl(var(--memorial-snow))',
					white: 'hsl(var(--memorial-white))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: { 
				sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				serif: ['Playfair Display', 'serif'], 
				mono: ['SFMono-Regular', 'monospace'],
				'memorial': ['Playfair Display', 'serif'], 
				'elegant': ['Crimson Text', 'serif'], 
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				memorial: 'var(--shadow-memorial)',
				elegant: 'var(--shadow-elegant)',
				deep: 'var(--shadow-deep)',
			},
			backgroundImage: {
				'memorial-gradient': 'linear-gradient(135deg, hsl(var(--memorial-white)) 0%, hsl(var(--memorial-snow)) 50%, hsl(var(--memorial-platinum)) 100%)',
				'memorial-dark-gradient': 'linear-gradient(135deg, hsl(var(--memorial-charcoal)) 0%, hsl(var(--memorial-black)) 50%, hsl(var(--memorial-dark-grey)) 100%)',
			},
			transitionTimingFunction: {
				'gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'memorial-glow': {
					'0%, 100%': {
						opacity: '0.7'
					},
					'50%': {
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'memorial-glow': 'memorial-glow 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
