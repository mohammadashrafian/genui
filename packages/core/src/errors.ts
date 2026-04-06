/** Thrown when a component is registered with a name that already exists. */
export class DuplicateRegistrationError extends Error {
  constructor(name: string) {
    super(`Component "${name}" is already registered. Use allowOverwrite option to replace.`);
    this.name = 'DuplicateRegistrationError';
  }
}

/** Thrown when trying to resolve a component that is not registered. */
export class ComponentNotFoundError extends Error {
  constructor(name: string) {
    super(`Component "${name}" is not registered.`);
    this.name = 'ComponentNotFoundError';
  }
}
