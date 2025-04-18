import { api } from "./api";

export const workersDays = api.injectEndpoints({
    endpoints: (builder) => ({
        getWorkingDays: builder.query({
            query: () => '/workingDays',
            providesTags: ['WorkingDays'],
        }),
        createWorkingDay: builder.mutation({
            query: ({ value }) => (console.log(value), {
                url: '/workingDays',
                method: 'POST',
                body: value,
            }),
            invalidatesTags: ['WorkingDays'],
        }),
        updateWorkingDay: builder.mutation({
            query: ({ id, value }) => ({
                url: `/workingDays/${id}`,
                method: 'PUT',
                body: { value },
            }),
            invalidatesTags: ['WorkingDays'],
        }),
        deleteWorkingDay: builder.mutation({
            query: (id) => ({
                url: `/workingDays/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['WorkingDays'],
        }),
    }),
});

export const {
    useGetWorkingDaysQuery,
    useCreateWorkingDayMutation,
    useUpdateWorkingDayMutation,
    useDeleteWorkingDayMutation,
} = workersDays;


