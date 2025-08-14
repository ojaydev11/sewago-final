module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ne'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
}
