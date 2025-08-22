import { Html, Head, Main, NextScript } from 'next/document'

// Ensure globals exist in server environment
if (typeof global !== 'undefined') {
  if (typeof global.self === 'undefined') {
    try { global.self = global; } catch (e) {}
  }
  if (typeof global.window === 'undefined') {
    try { global.window = global; } catch (e) {}
  }
  if (typeof global.document === 'undefined') {
    try { global.document = {}; } catch (e) {}
  }
  if (typeof global.navigator === 'undefined') {
    try { global.navigator = {}; } catch (e) {}
  }
  if (typeof global.location === 'undefined') {
    try { global.location = {}; } catch (e) {}
  }
}

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
