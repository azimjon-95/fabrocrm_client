import { api } from "./api";

export const workerApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Create Working Hours
        createWorkingHours: builder.mutation({
            query: (newWorkingHours) => ({
                url: '/workingHours/create',
                method: 'POST',
                body: newWorkingHours,
            }),
        }),

        // Get all Working Hours
        getAllWorkingHours: builder.query({
            query: () => '/workingHours/',
        }),

        // Get Working Hours by ID
        getWorkingHoursById: builder.query({
            query: (id) => `/workingHours/${id}`,
        }),

        // Update Working Hours by ID
        updateWorkingHours: builder.mutation({
            query: ({ id, updatedWorkingHours }) => ({
                url: `/workingHours/${id}`,
                method: 'PUT',
                body: updatedWorkingHours,
            }),
        }),

        // Delete Working Hours by ID
        deleteWorkingHours: builder.mutation({
            query: (id) => ({
                url: `/workingHours/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useCreateWorkingHoursMutation,
    useGetAllWorkingHoursQuery,
    useGetWorkingHoursByIdQuery,
    useUpdateWorkingHoursMutation,
    useDeleteWorkingHoursMutation,
} = workerApi;
