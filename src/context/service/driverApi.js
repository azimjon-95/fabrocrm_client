import { api } from "./api";

export const driverApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDrivers: builder.query({
      query: () => "/driver/all",
    }),
    createDriver: builder.mutation({
      query: (body) => ({
        url: "/driver/create",
        method: "POST",
        body,
      }),
    }),
    incrementBalance: builder.mutation({
      query: ({ id, amount }) => ({
        url: `/driver/increment/${id}`,
        method: "PUT",
        body: { amount },
      }),
    }),

    // Monthly report endpoint
    getDriverMonthlyData: builder.query({
      query: ({ year, month }) => ({
        url: "/driver/monthly-report",
        params: { year, month },
      }),
      providesTags: [
        "Drivers",
      ],
    }),


    decrementBalance: builder.mutation({
      query: ({ id, amount }) => ({
        url: `/driver/decrement/${id}`,
        method: "PUT",
        body: { amount },
      }),
    }),
    deleteDriver: builder.mutation({
      query: (id) => ({
        url: `/driver/delete/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetDriversQuery,
  useCreateDriverMutation,
  useIncrementBalanceMutation,
  useDecrementBalanceMutation,
  useDeleteDriverMutation,
  useGetDriverMonthlyDataQuery
} = driverApi;
