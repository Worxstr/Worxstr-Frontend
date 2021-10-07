import vuetify from './vuetify'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

export type DarkPreference = 'default' | 'light' | 'dark'

function getDarkMediaQuery() {
	return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
}

export function getStoredPreference(): DarkPreference {
	const storedValue = window.localStorage.getItem('darkMode') as DarkPreference
	return storedValue || 'default'
}

export async function setTheme(pref: DarkPreference) {

	const defaultIsDark = getDarkMediaQuery().matches

	let dark = false
	
	switch (pref) {
		case 'default':
			dark = defaultIsDark
			break
		case 'light':
			dark = false
			break
		case 'dark':
			dark = true
			break
	}

	vuetify.framework.theme.dark = dark
	window.localStorage.setItem('darkMode', pref)
	if (Capacitor.isNativePlatform()) {
		await StatusBar.setStyle({
			style: dark ? Style.Dark : Style.Light
		})
		if (Capacitor.getPlatform() === 'android') {
			const color = dark ? '#000000' : '#ffffff'
			await StatusBar.setBackgroundColor({ color })
		}
	}
}

export function initDarkMode() {
	setTimeout(() => setTheme(getStoredPreference()), 0)
	
	// Watch for changes on preferred theme
	const darkMediaQuery = getDarkMediaQuery()
	darkMediaQuery.addEventListener('change', (e) => {
		setTheme(getStoredPreference())
	})
}