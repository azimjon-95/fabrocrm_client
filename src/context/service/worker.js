import { api } from "./api";

export const worker = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET WORKERS
    getWorkers: builder.query({
      query: () => "worker/all",
      providesTags: ["Workers"],
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
  }),
});

export const {
  useGetWorkersQuery,
  useCreateWorkerMutation,
  useDeleteWorkerMutation,
  useUpdateWorkerMutation,
} = worker;
