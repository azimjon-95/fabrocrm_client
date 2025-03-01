import { api } from "./api";

export const balanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBalance: builder.query({
      query: () => "/balance",
      providesTags: ["Balance"],
    }),
    updateBalance: builder.mutation({
      query: (data) => ({
        url: "/balance/update",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Balance"],
    }),
  }),
});

export const { useGetBalanceQuery, useUpdateBalanceMutation } = balanceApi;
