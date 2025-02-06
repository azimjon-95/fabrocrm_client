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
            query: ({ id, updatedOrder }) => ({
                url: `/order/${id}`,
                method: "PUT",
                body: updatedOrder,
            }),
        }),

        // Delete an order
        deleteOrder: builder.mutation({
            query: (id) => ({
                url: `/order/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useGetOrdersQuery,
    useGetOrderByIdQuery,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
    useCreateOrderMutation,
} = orderApi;
