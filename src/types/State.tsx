import { Dispatch } from "react";

export type GlobalState<T> = [T, (value: T) => void];
export type State<T> = [T, Dispatch<T | any>];
