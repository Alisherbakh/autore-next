module.exports = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'kr', 'ru'],
		localeDetection: false,
	},
	// Kalitlar inglizcha matnning o'zi, ularda ":" va "." bor ("Next: {{name}}", "No credit cars yet.").
	// i18next standart holatda ":"ni namespace, "."ni ichma-ich kalit ajratgichi deb tushunadi — o'chirib qo'yamiz.
	keySeparator: false,
	nsSeparator: false,
	trailingSlash: true,
};
