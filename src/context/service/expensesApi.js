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

        getBalanceReport: builder.query({
            query: (expenseData) => ({
                url: `expenses/report`,
                method: 'POST',
                body: expenseData,
            }),
        }),

        getRelevantExpenses: builder.query({
            query: ({ relevantId, date }) => {
                // Agar date kelmasa, hozirgi oyni olamiz
                if (!date) {
                    const now = new Date();
                    date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-01`;
                }

                return {
                    url: `/expenses/relevant/${relevantId}`,
                    params: { date }
                };
            }
        }),
        getExpensesBySalary: builder.query({
            query: ({ year, month }) => `/expenses-by-salary?year=${year}&month=${month}`,
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
    useGetBalanceReportQuery,
    useGetRelevantExpensesQuery,
    useGetExpensesBySalaryQuery
} = expensesApi;
