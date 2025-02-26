import { api } from "./api";

export const listApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createOrderList: builder.mutation({
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

    getOrderLists: builder.query({
      query: () => "/list",
    }),

    getNewOrderLists: builder.query({
      query: () => "/list/new",
    }),

    getListById: builder.query({
      query: (id) => `/list/${id}`,
    }),

    updateOrderList: builder.mutation({
      query: ({ id, updateData }) => ({
        url: `/list/${id}`,
        method: "PATCH",
        body: updateData, // Faqat kerakli maydonlarni yuboring
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    deleteOrderList: builder.mutation({
      query: (id) => ({
        url: `/list/${id}`,
        method: "DELETE",
      }),
    }),

    getOrderHistory: builder.query({
      query: () => "/list-history",
    }),

    deleteMaterialById: builder.mutation({
      query: ({ orderId, materialId }) => ({
        url: `/list/${orderId}/materials/${materialId}`,
        method: "DELETE",
      }),
    }),

    // Redux Toolkit Query-da yangilash
    updateMaterialById: builder.mutation({
      query: ({ orderId, materialId, updateData }) => ({
        url: `/list/${orderId}/materials/${materialId}`,
        method: "PUT",
        body: updateData, // Faqat o'zgargan qiymatlar ketadi
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
  useGetListByIdQuery,
  useGetNewOrderListsQuery,
  useUpdateOrderListMutation,
  useDeleteOrderListMutation,
  useGetOrderHistoryQuery,
  useCreateMaterialMutation,
  useDeleteMaterialByIdMutation,
  useDeleteAllMaterialsMutation,
  useUpdateMaterialByIdMutation
} = listApi;
