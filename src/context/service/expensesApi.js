import { api } from "./api";

export const expensesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createExpense: builder.mutation({
      query: (expenseData) => ({
        url: "/expenses",
        method: "POST",
        body: expenseData,
      }),
      invalidatesTags: ["Expenses", "GETORDER"],
    }),
    getAllExpenses: builder.query({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
    getExpenseById: builder.query({
      query: (id) => `/expenses/${id}`,
      providesTags: ["Expenses"],
    }),
    updateExpense: builder.mutation({
      query: ({ id, expenseData }) => ({
        url: `/expenses/${id}`,
        method: "PUT",
        body: expenseData,
      }),
      invalidatesTags: ["Expenses", "GETORDER"],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expenses", "GETORDER"],
    }),

    getExpensesByPeriod: builder.query({
      query: (expenseData) => ({
        url: `expenses/period`,
        method: "POST",
        body: expenseData,
      }),
      providesTags: ["Expenses"],
    }),

    getBalanceReport: builder.query({
      query: (expenseData) => ({
        url: `expenses/report`,
        method: "POST",
        body: expenseData,
      }),
      providesTags: ["Expenses"],
    }),

    getRelevantExpenses: builder.query({
      query: ({ relevantId, date }) => {
        // Agar date kelmasa, hozirgi oyni olamiz
        if (!date) {
          const now = new Date();
          date = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-01`;
        }
        return {
          url: `/expenses/relevant/${relevantId}`,
          params: { date },
        };
      },
      providesTags: ["Expenses"],
    }),
    getExpensesBySalary: builder.query({
      query: ({ year, month }) =>
        `/expenses-by-salary?year=${year}&month=${month}`,
      providesTags: ["Expenses"],
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
  useGetExpensesBySalaryQuery,
} = expensesApi;
