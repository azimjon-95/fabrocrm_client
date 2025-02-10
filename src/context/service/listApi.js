import { api } from "./api";

export const listApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (orderData) => ({
                url: "/list",
                method: "POST",
                body: orderData,
            }),
        }),

        createMaterial: builder.mutation({
            query: ({ orderId, material }) => ({
                url: `/list/${orderId}/materials`,
                method: "POST",
                body: material,
            }),
            invalidatesTags: ["Order"],
        }),

        getOrders: builder.query({
            query: () => "/list",
        }),

        getOrderById: builder.query({
            query: (id) => `/list/${id}`,
        }),

        updateOrder: builder.mutation({
            query: ({ id, orderData }) => ({
                url: `/list/${id}`,
                method: "PUT",
                body: orderData,
            }),
        }),

        deleteOrder: builder.mutation({
            query: (id) => ({
                url: `/list/${id}`,
                method: "DELETE",
            }),
        }),

        deleteMaterialById: builder.mutation({
            query: ({ orderId, materialId }) => ({
                url: `/list/${orderId}/materials/${materialId}`,
                method: "DELETE",
            }),
        }),

        deleteAllMaterials: builder.mutation({
            query: (orderId) => ({
                url: `/list/${orderId}/materials`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetOrdersQuery,
    useGetOrderByIdQuery,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
    useDeleteMaterialByIdMutation,
    useDeleteAllMaterialsMutation,
    useCreateMaterialMutation,
} = listApi;
