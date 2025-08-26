export async function register() {
  // Run in all envs where SSR happens (build & server)
  const trap = (name: 'document' | 'window') => {
    if (name in globalThis) return; // if someone polyfilled earlier, skip
    Object.defineProperty(globalThis, name, {
      configurable: true,
      get() {
        const err = new Error(`[SSR trap] global ${name} accessed during server render`);
        // Trim the stack for readability
        const lines = (err.stack || '').split('\n').slice(0, 12).join('\n');
        console.error(lines);
        throw err; // make the build fail with a *useful* stack
      },
    });
  };

  trap('document');
  trap('window');
}
