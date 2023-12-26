import {Request} from "express";

export type Params = {
    id: string,
}

export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithParams<P> = Request<P, {}, {}, {}>
export type RequestWithParamsAndBody<P, B> = Request<P, {}, B, {}>
export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>
export type RequestWithParamsAndQuery<P, Q> = Request<P, {}, {}, Q>