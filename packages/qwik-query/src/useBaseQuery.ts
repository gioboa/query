import {
  noSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
  type NoSerialize,
} from '@builder.io/qwik'
import type { DefaultError, QueryKey } from '@tanstack/query-core'
import {
  InfiniteQueryObserver,
  QueryClient,
  QueryObserver,
  hydrate,
  notifyManager,
  type DehydratedState,
} from '@tanstack/query-core'
import type {
  QueryStore,
  QwikUseBaseQueryOptions,
  UseBaseQueryOptions,
} from './types'
import { createQueryClient } from './useQueryClient'
import { deqrlify, qrlify } from './utils'

export enum ObserverType {
  base,
  inifinite,
}

export function useBaseQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
>(
  observerType: ObserverType,
  options: QwikUseBaseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey,
    TPageParam
  >,
  initialState?: DehydratedState,
) {
  const queryClient = new QueryClient()
  if (initialState) {
    hydrate(queryClient, initialState)
  }
  const store = useStore({
    result: initialState
      ? queryClient.getQueryState<TQueryFnData, TError>(options.queryKey || [])
      : undefined,
    options,
  })
  const observerSig =
    useSignal<
      NoSerialize<
        QueryObserver<TQueryFnData, TError, TData, TQueryData, TQueryKey>
      >
    >()

  useVisibleTask$(async ({ cleanup }) => {
    const options = await deqrlify(store.options)
    const { observer, unsubscribe, defaultedOptions } = createQueryObserver(
      store,
      options,
      observerType,
    )
    observerSig.value = observer
    store.options = qrlify(defaultedOptions) as QwikUseBaseQueryOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey,
      TPageParam
    >

    cleanup(unsubscribe)
  })

  useVisibleTask$(async ({ track }) => {
    track(() => store.options)

    if (observerSig.value) {
      observerSig.value.setOptions(await deqrlify(store.options || options))
    }
  })

  return store
}

function createQueryObserver<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
>(
  store: QueryStore<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey,
    TPageParam
  >,
  options: UseBaseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey,
    TPageParam
  >,
  observerType: ObserverType,
) {
  const Observer =
    observerType === ObserverType.base
      ? QueryObserver
      : (InfiniteQueryObserver as typeof QueryObserver)
  const client = createQueryClient()

  const defaultedOptions = client.defaultQueryOptions(options)
  defaultedOptions._optimisticResults = 'optimistic'
  defaultedOptions.structuralSharing = false

  const observer = new Observer(client, defaultedOptions)
  if (!store.result) {
    const result = observer.getOptimisticResult(defaultedOptions)
    patchAndAssignResult(
      observerType,
      store,
      result,
      defaultedOptions,
      observer,
    )
  }

  const unsubscribe = observer.subscribe(
    notifyManager.batchCalls((result) => {
      patchAndAssignResult(
        observerType,
        store,
        result,
        defaultedOptions,
        observer,
      )
    }),
  )

  return { observer: noSerialize(observer), unsubscribe, defaultedOptions }
}

const patchAndAssignResult = async (
  observerType: any,
  store: any,
  result: any,
  defaultedOptions: any,
  observer: any,
) => {
  if (observerType === ObserverType.inifinite) {
    result.hasPreviousPage = await hasPage(
      store.options,
      result.data.pages,
      'PREV',
    )
    result.hasNextPage = await hasPage(store.options, result.data.pages, 'NEXT')
  }
  store.result = !defaultedOptions.notifyOnChangeProps
    ? noSerialize(observer.trackResult(result))
    : noSerialize(result)
}

const hasPage = async (
  options: any,
  pages: any,
  dicrection: 'PREV' | 'NEXT',
) => {
  const getPageParam =
    dicrection === 'PREV'
      ? options.getPreviousPageParam
      : options.getNextPageParam
  if (getPageParam && Array.isArray(pages)) {
    const pageParam = await getPageParam(
      dicrection === 'PREV' ? pages[0] : pages[pages.length - 1],
      pages,
    )
    console.log('pageParam', pageParam, dicrection)
    return (
      typeof pageParam !== 'undefined' &&
      pageParam !== null &&
      pageParam !== false
    )
  }
  return
}
