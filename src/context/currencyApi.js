import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const currencyApi = createApi({
    reducerPath: 'currencyApi', // ❗ Eslatma: bu reducerPath nomi `store.js` bilan bir xil bo‘lishi kerak
    baseQuery: fetchBaseQuery({ baseUrl: 'https://cbu.uz/uz/arkhiv-kursov-valyut/' }),
    endpoints: (builder) => ({
        getCurrencyRates: builder.query({
            query: () => 'json/',
        }),
    }),
});

export const { useGetCurrencyRatesQuery } = currencyApi;
