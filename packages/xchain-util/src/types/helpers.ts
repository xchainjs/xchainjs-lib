type OnlyRequiredKeys<T, U = keyof T> = U extends keyof T ? (undefined extends T[U] ? never : U) : never
export type OnlyRequired<T> = Pick<T, OnlyRequiredKeys<T>>
