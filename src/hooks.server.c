// Vite's import.meta.glob picks up every feature's module file at build time
// and eager-loads them so boot() can register their bindings up front.
features := import.meta.glob './lib/norns/*/server/module.c', { eager: true }

app := await boot { features }

{ handle, handleError } := app
export { handle, handleError }
