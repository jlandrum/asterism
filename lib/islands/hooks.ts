import { useState as _useState, useEffect as _useEffect, Dispatch, SetStateAction } from 'react';

export const useState = <S,>(initialState: S) => (hydrate?: boolean): [S, Dispatch<SetStateAction<S>>] => {
	return hydrate ? _useState(initialState) : [initialState, () => {}];
}

export const useEffect = (callback: () => void, deps: any[]) => (hydrate?: boolean) => {
	return hydrate ? _useEffect(callback, deps) : () => { callback() };
}
