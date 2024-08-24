declare interface StorageFacility {
  setItem: (key: string, value: string) => void,
  getItem: (key: string) => string | null
}