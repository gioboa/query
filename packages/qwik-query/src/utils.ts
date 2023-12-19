import { type QueryClient, dehydrate } from '@tanstack/query-core'
import { DeQRLify, QRLify } from './types'
import { qrl } from '@builder.io/qwik'

export const queryClientState = (queryClient: QueryClient) =>
  dehydrate(queryClient)

export function qrlify<T>(value: T): QRLify<T> {
  if (typeof value === 'function') {
    return qrl(
      value as unknown as string,
      Math.random().toString(16),
    ) as QRLify<T>
  }

  if (typeof value !== 'object') return value as QRLify<T>
  if (value === null) return value as QRLify<T>

  if (Array.isArray(value)) {
    return value.map((value) => qrlify(value)) as QRLify<T>
  }

  const entries = Object.entries(([key, value]: unknown[]) => [
    key,
    qrlify(value),
  ])
  return Object.fromEntries(entries) as QRLify<T>
}

export async function deqrlify<T>(value: T): Promise<DeQRLify<T>> {
  // QRL
  if (
    typeof value === 'function' &&
    'resolve' in value &&
    typeof value.resolve === 'function'
  ) {
    const awaited = await value.resolve()
    return awaited as DeQRLify<T>
  }

  if (typeof value !== 'object') return value as DeQRLify<T>
  if (value === null) return value as DeQRLify<T>

  if (Array.isArray(value)) {
    const promises = value.map((value: unknown) => deqrlify(value))
    const awaited = await Promise.all(promises)
    return awaited as DeQRLify<T>
  }

  const promises = Object.entries(value).map(
    async ([key, value]: unknown[]) => [key, await deqrlify(value)],
  )
  const awaited = await Promise.all(promises)
  return Object.fromEntries(awaited) as DeQRLify<T>
}
