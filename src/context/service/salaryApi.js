// services/salariesApi.js
import { api } from "./api";

export const salariesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getSalaries: builder.query({
            query: () => '/salaries',
        }),
        getSalaryById: builder.query({
            query: (id) => `/salaries/${id}`,
        }),
        createSalary: builder.mutation({
            query: (newSalary) => ({
                url: '/salaries',
                method: 'POST',
                body: newSalary,
            }),
        }),
        updateSalary: builder.mutation({
            query: ({ id, updatedSalary }) => ({
                url: `/salaries/${id}`,
                method: 'PUT',
                body: updatedSalary,
            }),
        }),
        deleteSalary: builder.mutation({
            query: (id) => ({
                url: `/salaries/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetSalariesQuery,
    useGetSalaryByIdQuery,
    useCreateSalaryMutation,
    useUpdateSalaryMutation,
    useDeleteSalaryMutation,
} = salariesApi;
