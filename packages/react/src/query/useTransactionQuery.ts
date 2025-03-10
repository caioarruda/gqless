import {
  doRetry,
  GQlessClient,
  GQlessError,
  ResolveOptions,
  RetryOptions,
} from '@gqless-transport-ws/gqless';
import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import {
  FetchPolicy,
  fetchPolicyDefaultResolveOptions,
  OnErrorHandler,
  useDeferDispatch,
  useSelectionsState,
  useSubscribeCacheChanges,
  useSuspensePromise,
  useUpdateEffect,
} from '../common';
import { ReactClientOptionsWithDefaults } from '../utils';

export interface UseTransactionQueryState<TData> {
  data: TData | undefined;
  error?: GQlessError;
  isLoading: boolean;
  isCalled: boolean;
}

type UseTransactionQueryReducerAction<TData> =
  | { type: 'cache-found'; data: TData }
  | { type: 'success'; data: TData }
  | { type: 'failure'; error: GQlessError }
  | { type: 'loading' }
  | {
    type: 'done';
  };

function UseTransactionQueryReducer<TData>(
  state: UseTransactionQueryState<TData>,
  action: UseTransactionQueryReducerAction<TData>
): UseTransactionQueryState<TData> {
  switch (action.type) {
    case 'loading': {
      if (state.isLoading) return state;
      return {
        data: state.data,
        isLoading: true,
        isCalled: true,
      };
    }
    case 'success': {
      return {
        data: action.data,
        isLoading: false,
        isCalled: true,
      };
    }
    case 'cache-found': {
      return {
        data: action.data,
        isLoading: state.isLoading,
        isCalled: true,
      };
    }
    case 'failure': {
      return {
        data: state.data,
        isLoading: false,
        error: action.error,
        isCalled: true,
      };
    }
    case 'done': {
      if (state.isLoading) {
        return {
          data: state.data,
          isLoading: false,
          isCalled: true,
        };
      }
      return state;
    }
  }
}

function InitUseTransactionQueryReducer<TData, TVariables>({
  skip,
}: UseTransactionQueryOptions<
  TData,
  TVariables
>): UseTransactionQueryState<TData> {
  return {
    data: undefined,
    isLoading: skip ? false : true,
    isCalled: false,
  };
}

export type UseTransactionQueryOptions<TData, TVariables> = {
  fetchPolicy?: FetchPolicy;
  skip?: boolean;
  pollInterval?: number;
  notifyOnNetworkStatusChange?: boolean;
  variables?: TVariables;
  onCompleted?: (data: TData) => void;
  onError?: OnErrorHandler;
  retry?: RetryOptions;
  suspense?: boolean;
} & (TVariables extends undefined
  ? { variables?: TVariables }
  : { variables: TVariables });

export interface UseTransactionQuery<
  GeneratedSchema extends {
    query: object;
  }
> {
  <TData, TVariables = undefined>(
    fn: (query: GeneratedSchema['query'], variables: TVariables) => TData,
    ...[queryOptions]: undefined extends TVariables
      ? [UseTransactionQueryOptions<TData, TVariables>?]
      : [UseTransactionQueryOptions<TData, TVariables>]
  ): UseTransactionQueryState<TData>;
}

export function createUseTransactionQuery<
  GeneratedSchema extends {
    query: object;
    mutation: object;
    subscription: object;
  }
>(
  client: GQlessClient<GeneratedSchema>,
  {
    defaults: {
      transactionFetchPolicy: defaultFetchPolicy,
      retry: defaultRetry,
      transactionQuerySuspense: defaultSuspense,
    },
  }: ReactClientOptionsWithDefaults
) {
  const { resolved, eventHandler, refetch } = client;
  const clientQuery: GeneratedSchema['query'] = client.query;

  const useTransactionQuery: UseTransactionQuery<GeneratedSchema> = function useTransactionQuery<
    TData,
    TVariables
  >(
    fn: (query: typeof clientQuery, variables: TVariables) => TData,
    ...[queryOptions]: undefined extends TVariables
      ? [UseTransactionQueryOptions<TData, TVariables>?]
      : [UseTransactionQueryOptions<TData, TVariables>]
  ) {
    const rejectedPromise = useRef<unknown>();

    if (rejectedPromise.current) throw rejectedPromise.current;

    const opts = Object.assign({}, queryOptions);

    opts.fetchPolicy ??= defaultFetchPolicy;
    opts.retry ??= defaultRetry;
    opts.suspense ??= defaultSuspense;

    opts.notifyOnNetworkStatusChange ??= true;

    const optsRef = useRef(opts);
    optsRef.current = opts;

    const setSuspensePromise = useSuspensePromise(optsRef);

    const { skip, pollInterval = 0, fetchPolicy, variables } = opts;

    const hookSelections = useSelectionsState();

    const resolveOptions = useMemo<ResolveOptions<TData>>(() => {
      return fetchPolicyDefaultResolveOptions(fetchPolicy);
    }, [fetchPolicy]);

    const [state, dispatchReducer] = useReducer(
      UseTransactionQueryReducer,
      opts,
      InitUseTransactionQueryReducer
    ) as [
        UseTransactionQueryState<TData>,
        Dispatch<UseTransactionQueryReducerAction<TData>>
      ];
    const dispatch = useDeferDispatch(dispatchReducer);

    const stateRef = useRef(state);
    stateRef.current = state;

    const fnRef = useRef(fn);
    fnRef.current = fn;

    const isFetching = useRef(false);

    const pendingPromise = useRef<ReturnType<typeof queryCallback>>();

    const queryCallback = useCallback(
      (
        resolveOptsArg: Omit<
          ResolveOptions<TData>,
          'onSelection' | 'onCacheData'
        > = {},
        fetchPolicyArg: FetchPolicy | undefined = fetchPolicy,
        cacheChangeCall?: boolean
      ) => {
        if (skip) {
          return Promise.resolve(
            dispatch({
              type: 'done',
            })
          );
        }

        stateRef.current.isCalled = true;

        const fn = () => fnRef.current(clientQuery, optsRef.current.variables!);

        stateRef.current.isLoading = false;

        let instaResolved = false;
        const promise = resolved<TData>(fn, {
          ...resolveOptions,
          ...resolveOptsArg,
          onSelection(selection) {
            hookSelections.add(selection);
          },
          onEmptyResolve() {
            instaResolved = true;
          },
          onCacheData(data): boolean {
            switch (fetchPolicyArg) {
              case 'cache-and-network': {
                stateRef.current.isLoading = true;
                dispatch({
                  type: 'cache-found',
                  data,
                });
                stateRef.current.data = data;
                return true;
              }
              case 'cache-first': {
                instaResolved = true;

                if (cacheChangeCall) {
                  dispatch({
                    type: 'success',
                    data,
                  });
                }

                stateRef.current.data = data;
                return false;
              }
              default: {
                return true;
              }
            }
          },
          onNoCacheFound() {
            isFetching.current = true;
            dispatch({
              type: 'loading',
            });
            stateRef.current.isLoading = true;
          },
        }).then(
          (data) => {
            pendingPromise.current = undefined;
            optsRef.current.onCompleted?.(data);
            isFetching.current = false;
            if (stateRef.current.isLoading || stateRef.current.data !== data) {
              dispatch({
                type: 'success',
                data,
              });
              stateRef.current.data = data;
            }
            stateRef.current.isLoading = false;
          },
          (err: unknown) => {
            pendingPromise.current = undefined;
            isFetching.current = false;
            const error = GQlessError.create(err, useTransactionQuery);
            optsRef.current.onError?.(error);
            dispatch({
              type: 'failure',
              error,
            });
            stateRef.current.error = error;
            stateRef.current.isLoading = false;

            return error;
          }
        );

        if (instaResolved) return;

        pendingPromise.current = promise;
        return promise;
      },
      [fetchPolicy, skip, stateRef, resolveOptions, fnRef, dispatch, optsRef]
    );

    const serializedVariables = useMemo(() => {
      return variables ? JSON.stringify(variables) : '';
    }, [variables]);

    const queryCallbackWithPromise = useCallback(
      (inlineCall?: boolean) => {
        if (skip) return;

        const promise = queryCallback()?.then((result) => {
          if (result instanceof GQlessError) {
            if (optsRef.current.retry) {
              doRetry(optsRef.current.retry, {
                async onRetry() {
                  const retryPromise = queryCallback({
                    refetch: true,
                  })?.then((result) => {
                    if (result instanceof GQlessError) throw result;
                  });

                  if (retryPromise) {
                    setSuspensePromise(retryPromise);

                    await retryPromise;
                  }
                },
              });
            } else if (optsRef.current.suspense) {
              throw result;
            }
          }
        });

        if (promise) {
          if (inlineCall) {
            Promise.resolve().then(() => {
              setSuspensePromise(promise);
            });
          } else {
            setSuspensePromise(promise);
          }
        }
      },
      [queryCallback, skip, setSuspensePromise, optsRef]
    );

    if (!state.isCalled && !skip) {
      queryCallbackWithPromise(true);
    }

    useUpdateEffect(() => {
      queryCallbackWithPromise();
    }, [queryCallbackWithPromise, serializedVariables]);

    useEffect(() => {
      if (skip || pollInterval <= 0) return;

      let isMounted = true;

      const interval = setInterval(() => {
        if (isFetching.current) return;

        isFetching.current = true;

        if (isMounted && optsRef.current.notifyOnNetworkStatusChange)
          dispatch({
            type: 'loading',
          });

        const fn = () => fnRef.current(clientQuery, optsRef.current.variables!);

        (resolveOptions.noCache
          ? resolved<TData>(fn, resolveOptions)
          : refetch<TData>(fn)
        ).then(
          (data) => {
            pendingPromise.current = undefined;
            isFetching.current = false;
            if (isMounted)
              dispatch({
                type: 'success',
                data,
              });
          },
          (err) => {
            pendingPromise.current = undefined;
            isFetching.current = false;
            if (isMounted)
              dispatch({
                type: 'failure',
                error: GQlessError.create(err, useTransactionQuery),
              });
          }
        );
      }, pollInterval);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }, [
      pollInterval,
      skip,
      resolveOptions,
      optsRef,
      fnRef,
      dispatch,
      isFetching,
    ]);

    useSubscribeCacheChanges({
      hookSelections,
      eventHandler,
      shouldSubscribe: fetchPolicy !== 'no-cache',
      onChange() {
        if (pendingPromise.current) return;

        queryCallback(
          {
            refetch: false,
          },
          'cache-first',
          true
        );
      },
    });

    return state;
  };

  return useTransactionQuery;
}
