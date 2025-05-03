import { api } from "./api";

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all orders
    getOrders: builder.query({
      query: () => "/order/",
      providesTags: ["Order"],
    }),

    // Update an existing order
    getOrderById: builder.query({
      query: (id) => ({
        url: `/order/${id}`,
        method: "GET",
      }),
      providesTags: ["GETORDER", "Order"],
    }),

    // Create a new order
    createOrder: builder.mutation({
      query: (newOrder) => ({
        url: "/order/",
        method: "POST",
        body: newOrder,
      }),
      invalidatesTags: ["Order", "GETORDER"],
    }),

    // useUpdateMaterialValueMutation {
    //   orderId,
    //   materialId: material.materialID,
    //   orderCardId,
    //   value,
    // }
    updateMaterialValue: builder.mutation({
      query: ({ orderId, materialId, orderCardId, value }) => (console.log(orderId, materialId, orderCardId, value), {
        url: `/ordermain/${orderId}/material/${materialId}/${orderCardId}`,
        method: "PUT",
        body: { value },
      }),
      invalidatesTags: ["Order", "GETORDER"],
    }),

    createOrderIntoInfo: builder.mutation({
      query: ({ infoId, formData }) => {
        return {
          url: `/orderIntoInfo/${infoId}`,
          method: "POST",
          body: formData, // bu yerda FormData ni bevosita jo‘natyapmiz
        };
      },
      invalidatesTags: ["Order", "GETORDER"],
    }),

    //router.delete('/orderinfo/:infoId/orders/:orderId'
    deleteOrderIntoInfo: builder.mutation({
      query: ({ infoId, orderId }) => ({
        url: `/orderIntoInfo/${infoId}/orders/${orderId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order", "GETORDER"],
    }),

    // Create a new additional material
    createAdditionalMaterial: builder.mutation({
      query: (newAdditional) => ({
        url: "/order/additional/material/",
        method: "POST",
        body: newAdditional,
      }),
      invalidatesTags: ["Order", "GETORDER"],
    }),

    // Update an existing order
    updateOrder: builder.mutation({
      query: ({ id, updates }) => ({
        url: `/order/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Order", "GETORDER"],
    }),

    // Delete an order
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),

    // Give material to an order
    giveMaterial: builder.mutation({
      query: (data) => ({
        url: "/order/giveMaterial",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "GETORDER"],
    }),
    ///order/giveMaterialSoldo
    giveMaterialSoldo: builder.mutation({
      query: (data) => ({
        url: "/order/giveMaterialSoldo",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "GETORDER"],
    }),

    // Get order progress
    orderProgress: builder.query({
      query: (orderId) => `/order/progress/${orderId}`,
      providesTags: ["GETORDER", "Order"],
    }),

    ///order/get-material/:orderId/:materialId
    getMaterialById: builder.query({
      query: ({ orderId, materialId }) => ({
        url: `/order/get-material/${orderId}/${materialId}`,
        method: "GET",
      }),
      providesTags: ["GETORDER", "Order"],
    }),

    ///order/get-all-material/:orderId
    getAllMaterialById: builder.query({
      query: (orderId) => ({
        url: `/order/get-all-material/${orderId}`,
        method: "GET",
      }),
      providesTags: ["GETORDER", "Order"],
    }),

    // /order/debt
    getDebt: builder.query({
      query: () => "/order-debt",
      providesTags: ["GETORDER", "Order"],
    }),

    // qarzdorlarni olish "/order/debtors
    getDebtors: builder.query({
      query: () => "/ordergetdebtors",
      invalidatesTags: ["GETORDER"],
    }),

    completeOrder: builder.mutation({
      query: (data) => ({
        url: "/complete-order",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "GETORDER"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useCreateOrderMutation,
  useCreateAdditionalMaterialMutation,
  useGiveMaterialMutation,
  useOrderProgressQuery,
  useGetMaterialByIdQuery,
  useGetAllMaterialByIdQuery,
  useGetDebtQuery,
  useGetDebtorsQuery,
  useCompleteOrderMutation,
  useGiveMaterialSoldoMutation,
  useCreateOrderIntoInfoMutation,
  useDeleteOrderIntoInfoMutation,
  useUpdateMaterialValueMutation
} = orderApi;
