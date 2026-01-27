import axios, { AxiosResponse } from 'axios';
import { constants } from 'http2';
// @ts-ignore
import httpAdapter from 'axios/lib/adapters/http';

const BASE_URL = process.env.BASE_URL;
const isExpectedStatusCode = (code: number) =>
    [constants.HTTP_STATUS_BAD_REQUEST, constants.HTTP_STATUS_UNAUTHORIZED].includes(code);

const axiosInstance = axios.create({
    adapter: httpAdapter,
    baseURL: BASE_URL,
    headers: { Accept: 'application/json' },
    timeout: 5000
});

axiosInstance.interceptors.response.use(
    function (response: AxiosResponse) {
        return response;
    },
    function (error: any) {
        const statusCode = error?.response?.status;

        if (statusCode && isExpectedStatusCode(statusCode)) {
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export { axiosInstance };