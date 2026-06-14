export interface User {
  readonly id: number | string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly active: boolean;
}
