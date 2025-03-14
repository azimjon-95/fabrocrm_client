import { api } from "./api";

export const myDebtsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getmyDebts: builder.query({
      query: () => "/myDebts/all",
      providesTags: ["myDebts"],
    }),
    getIsPaidFalse: builder.query({
      query: () => "/myDebts",
      providesTags: ["myDebts"],
    }),
    postMyDebt: builder.mutation({
      query: (body) => ({
        url: "/myDebts/create",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["myDebts"],
    }),
    paymentForDebt: builder.mutation({
      query: ({ id, body }) => ({
        url: `/myDebts/payment/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["myDebts"],
    }),
  }),
});

export const {
  useGetmyDebtsQuery,
  useGetIsPaidFalseQuery,
  usePostMyDebtMutation,
  usePaymentForDebtMutation,
} = myDebtsApi;
