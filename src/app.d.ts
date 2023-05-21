// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

declare namespace Lucia {
  type Auth = any;
  type UserAttributes = {
    username: string;
  };
}

export {};
