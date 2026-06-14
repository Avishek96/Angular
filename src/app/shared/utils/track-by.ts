export const trackById = <T extends { readonly id: number | string }>(_index: number, item: T) =>
  item.id;
