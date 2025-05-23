import { api } from "./api";

export const worker = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET WORKERS
    getWorkers: builder.query({
      query: () => "/worker/all",
      providesTags: ["Workers"],
    }),
    // GET WORKERS
    getWorkersMain: builder.query({
      query: () => "/workermain/all",
      providesTags: ["Workers"],
    }),

    //get("/worker/monthlyData"
    getWorkerMonthlyData: builder.query({
      query: ({ userId, year, month }) => ({
        url: "worker/monthlyData",
        params: { userId, year, month },
      }),
      providesTags: ["Workers"],
    }),

    ///totalRemainingSalary"
    getTotalRemainingSalary: builder.query({
      query: ({ year, month }) => ({
        url: 'worker/totalRemainingSalary',
        params: { year, month },
      }),
      providesTags: ['Workers'],
    }),

    // POST || CREATE WORKER
    createWorker: builder.mutation({
      query: (formData) => ({
        url: "worker/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Workers"],
    }),

    // DELETE WORKER
    deleteWorker: builder.mutation({
      query: (id) => ({
        url: `worker/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workers"],
    }),

    // PUT || UPDATE WORKER
    updateWorker: builder.mutation({
      query: ({ id, body }) => ({
        url: `/worker/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Workers"],
    }),


    // New salary endpoints
    getWorkerSalaries: builder.query({
      query: (workerId) => `/workers/${workerId}/salaries`,
      providesTags: ['Salary'],
      transformResponse: (response) => response.innerData, // Extract innerData from response
    }),
    createWorkerSalary: builder.mutation({
      query: ({ workerId, salary }) => ({
        url: `/workers/${workerId}/salaries`,
        method: 'POST',
        body: { salary },
      }),
      invalidatesTags: ['Salary'],
      // transformResponse: (response) => response.innerData, // Extract innerData from response
    }),
    deleteWorkerSalary: builder.mutation({
      query: ({ workerId, salaryId }) => ({
        url: `/workers/${workerId}/salaries/${salaryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Salary'],
      // transformResponse: (response) => response.innerData, // Extract innerData from response
    }),
  }),
});

export const {
  useGetWorkersQuery,
  useCreateWorkerMutation,
  useDeleteWorkerMutation,
  useUpdateWorkerMutation,
  useGetWorkerMonthlyDataQuery,
  useGetTotalRemainingSalaryQuery,
  useGetWorkersMainQuery,
  useGetWorkerSalariesQuery,
  useCreateWorkerSalaryMutation,
  useDeleteWorkerSalaryMutation
} = worker;
