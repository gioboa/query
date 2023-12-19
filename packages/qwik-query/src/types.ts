import type { QRL } from '@builder.io/qwik'
import {
  QueryKey,
  DefaultError,
  QueryObserverOptions,
  WithRequired,
  InfiniteQueryObserverOptions,
  QueryObserverResult,
  QueryObserverSuccessResult,
  DefinedQueryObserverResult,
  InfiniteQueryObserverResult,
  DefinedInfiniteQueryObserverResult,
  InfiniteQueryObserverSuccessResult,
  MutationObserverOptions,
  MutateFunction,
  MutationObserverResult,
  QueryState,
} from '@tanstack/query-core'

type QRLifyProperty<T> = T extends (...args: any[]) => any ? QRL<T> : QRLify<T>

export type QRLify<T> = { [K in keyof T]: QRLifyProperty<T[K]> }

export type DeQRLify<T> = T extends QRLify<infer U> ? U : T

export type UseBaseQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
> = WithRequired<
  QueryObserverOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey,
    TPageParam
  >,
  'queryKey'
>

export type QwikUseBaseQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
> = QRLify<
  UseBaseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey,
    TPageParam
  >
>

export type QueryStore<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
> = {
  result: QueryState<TQueryFnData, TError> | undefined
  options: QwikUseBaseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey,
    TPageParam
  >
}

// ———

export interface UseQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    WithRequired<
      QwikUseBaseQueryOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryFnData,
        TQueryKey
      >,
      'queryKey'
    >,
    'suspense'
  > {}

export interface UseSuspenseQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'enabled' | 'throwOnError' | 'placeholderData'
  > {}

export interface UseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends WithRequired<
    Omit<
      InfiniteQueryObserverOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryData,
        TQueryKey
      >,
      'suspense'
    >,
    'queryKey'
  > {}

export interface UseSuspenseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
    'enabled' | 'throwOnError' | 'placeholderData'
  > {}

export type UseBaseQueryResult<
  TData = unknown,
  TError = DefaultError,
> = QueryObserverResult<TData, TError>

export type UseQueryResult<
  TData = unknown,
  TError = DefaultError,
  TOptions = UseQueryOptions,
> = {
  options: TOptions
  result: UseBaseQueryResult<TData, TError>
}

export type UseSuspenseQueryResult<
  TData = unknown,
  TError = DefaultError,
> = Omit<QueryObserverSuccessResult<TData, TError>, 'isPlaceholderData'>

export type DefinedUseQueryResult<
  TData = unknown,
  TError = DefaultError,
  TOptions = UseQueryOptions,
> = {
  options: TOptions
  result: DefinedQueryObserverResult<TData, TError>
}

export type UseInfiniteQueryResult<
  TData = unknown,
  TError = DefaultError,
> = InfiniteQueryObserverResult<TData, TError>

export type DefinedUseInfiniteQueryResult<
  TData = unknown,
  TError = DefaultError,
> = DefinedInfiniteQueryObserverResult<TData, TError>

export type UseSuspenseInfiniteQueryResult<
  TData = unknown,
  TError = DefaultError,
> = Omit<InfiniteQueryObserverSuccessResult<TData, TError>, 'isPlaceholderData'>

export interface UseMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
> extends Omit<
    MutationObserverOptions<TData, TError, TVariables, TContext>,
    '_defaulted' | 'variables'
  > {}

export type UseMutateFunction<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
> = (
  ...args: Parameters<MutateFunction<TData, TError, TVariables, TContext>>
) => void

export type UseMutateAsyncFunction<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
> = MutateFunction<TData, TError, TVariables, TContext>

export type UseBaseMutationResult<
  TData = unknown,
  TError = DefaultError,
  TVariables = unknown,
  TContext = unknown,
> = Override<
  MutationObserverResult<TData, TError, TVariables, TContext>,
  { mutate: UseMutateFunction<TData, TError, TVariables, TContext> }
> & {
  mutateAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>
}

export type UseMutationResult<
  TData = unknown,
  TError = DefaultError,
  TVariables = unknown,
  TContext = unknown,
> = UseBaseMutationResult<TData, TError, TVariables, TContext>

type Override<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] }
