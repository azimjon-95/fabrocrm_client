import { api } from "./api";

export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAdmins: builder.query({
            query: () => "/admin/all",
        }),
        createAdmin: builder.mutation({
            query: (adminData) => ({
                url: "/admin/create",
                method: "POST",
                body: adminData,
            }),
        }),
        loginAdmin: builder.mutation({
            query: (credentials) => ({
                url: "/admin/login",
                method: "POST",
                body: credentials,
            }),
        }),
        deleteAdmin: builder.mutation({
            query: (id) => ({
                url: `/admin/delete/${id}`,
                method: "DELETE",
            }),
        }),
        updateAdmin: builder.mutation({
            query: ({ id, updatedData }) => ({
                url: `/admin/update/${id}`,
                method: "PUT",
                body: updatedData,
            }),
        }),
    }),
});

export const {
    useGetAdminsQuery,
    useCreateAdminMutation,
    useLoginAdminMutation,
    useDeleteAdminMutation,
    useUpdateAdminMutation,
} = adminApi;
