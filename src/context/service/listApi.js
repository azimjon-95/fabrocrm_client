import { api } from "./api";

export const listApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createOrderList: builder.mutation({
            query: (orderData) => (console.log(orderData), {
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

        getOrderLists: builder.query({
            query: () => "/list",
        }),

        getOrderById: builder.query({
            query: (id) => `/list/${id}`,
        }),

        updateOrderList: builder.mutation({
            query: ({ id, orderData }) => ({
                url: `/list/${id}`,
                method: "PUT",
                body: orderData,
            }),
        }),

        deleteOrderList: builder.mutation({
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
    useCreateOrderListMutation,
    useGetOrderListsQuery,
    useGetOrderByIdQuery,
    useUpdateOrderListMutation,
    useDeleteOrderListMutation,
    useDeleteMaterialByIdMutation,
    useDeleteAllMaterialsMutation,
    useCreateMaterialMutation,
} = listApi;
