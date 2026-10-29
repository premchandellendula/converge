import { toQueryString } from "@/lib/queryString";
import { request, requestList } from "@/lib/request";

export const dataProvider = {
    getList: <T>(resource: string, params: object = {}) => requestList<T>(`/${resource}${toQueryString(params)}`),

    getOne: <T>(resource: string, id: number | string) => request<T>(`/${resource}/${id}`),

    create: <T = { id: number | string}>(resource: string, data: object) => request<T>(`/${resource}`, { method: "POST", body: JSON.stringify(data)  }),
    
    update: <T = { id: number | string }>(resource: string, id: number | string, data: object) => request<T>(`/${resource}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

    remove: <T = { id: number | string }>(resource: string, id: number | string) => request<T>(`/${resource}/${id}`, { method: "DELETE" }),
} as const;

export type DataProvider = typeof dataProvider;