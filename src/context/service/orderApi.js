import { api } from "./api";

export const orderApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all orders
        getOrders: builder.query({
            query: () => "/order/",
        }),

        // Fetch order by ID
        getOrderById: builder.query({
            query: (id) => `/order/${id}`,
        }),

        // Create a new order
        createOrder: builder.mutation({
            query: (newOrder) => ({
                url: "/order/",
                method: "POST",
                body: newOrder,
            }),
        }),




        // Update an existing order
        updateOrder: builder.mutation({
            query: ({ id, updates }) => ({
                url: `/order/${id}`,
                method: "PUT",
                body: updates,
            }),
        }),

        // Delete an order
        deleteOrder: builder.mutation({
            query: (id) => ({
                url: `/order/${id}`,
                method: "DELETE",
            }),
        }),

        // Give material to an order
        giveMaterial: builder.mutation({
            query: (data) => ({
                url: "/order/giveMaterial",
                method: "POST",
                body: data,
            }),
        }),

        // Get order progress
        orderProgress: builder.query({
            query: (orderId) => `/order/progress/${orderId}`,
        }),

        ///order/get-material/:orderId/:materialId
        getMaterialById: builder.query({
            query: ({ orderId, materialId }) => ({
                url: `/order/get-material/${orderId}/${materialId}`,
                method: "GET",
            }),
        }),

        ///order/get-all-material/:orderId
        getAllMaterialById: builder.query({
            query: (orderId) => ({
                url: `/order/get-all-material/${orderId}`,
                method: "GET",
            }),
        }),

        // /order/debt
        getDebt: builder.query({
            query: () => "/order-debt",
        }),
    }),
});

export const {
    useGetOrdersQuery,
    useGetOrderByIdQuery,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
    useCreateOrderMutation,
    useGiveMaterialMutation,
    useOrderProgressQuery,
    useGetMaterialByIdQuery,
    useGetAllMaterialByIdQuery,
    useGetDebtQuery
} = orderApi;
