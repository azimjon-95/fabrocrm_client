import { api } from "./api";

export const expensesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createExpense: builder.mutation({
            query: (expenseData) => ({
                url: '/expenses',
                method: 'POST',
                body: expenseData,
            }),
        }),
        getAllExpenses: builder.query({
            query: () => '/expenses',
        }),
        getExpenseById: builder.query({
            query: (id) => `/expenses/${id}`,
        }),
        updateExpense: builder.mutation({
            query: ({ id, expenseData }) => ({
                url: `/expenses/${id}`,
                method: 'PUT',
                body: expenseData,
            }),
        }),
        deleteExpense: builder.mutation({
            query: (id) => ({
                url: `/expenses/${id}`,
                method: 'DELETE',
            }),
        }),

        getExpensesByPeriod: builder.query({
            query: (expenseData) => ({
                url: `expenses/period`,
                method: 'POST',
                body: expenseData,
            }),
        }),


    }),
});

export const {
    useGetAllExpensesQuery,
    useGetExpenseByIdQuery,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
    useGetExpensesByPeriodQuery,
    useCreateExpenseMutation,
} = expensesApi;
