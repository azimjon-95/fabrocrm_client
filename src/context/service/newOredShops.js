import { api } from "./api";

export const ShopsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Yangi buyurtma qo'shish
    createShop: builder.mutation({
      query: (newShop) => ({
        url: "/newShops",
        method: "POST",
        body: newShop,
      }),
      invalidatesTags: ["Shops"],
    }),

    // Barcha buyurtmalarni olish
    getAllShops: builder.query({
      query: () => "/newShops",
      providesTags: ["Shops"],
    }),

    // shopsId bo'yicha buyurtmalarni olish
    getShopsByShop: builder.query({
      query: (shopsId) => `/newShops/${shopsId}`,
      providesTags: (shopsId) => [{ type: "Shops", id: shopsId }],
    }),

    // shopsId bo'yicha barcha isPaid: false bo'lgan buyurtmalarni topib, totalPrice ni yig'ish
    getUnpaidTotalByShop: builder.query({
      query: (shopsId) => `/newShops/unpaid/total/${shopsId}`,
      providesTags: (shopsId) => [{ type: "Shops", id: shopsId }],
    }),

    // Barcha isPaid: false bo'lgan buyurtmalarni topib, totalPrice ni yig'ish
    getUnpaidTotal: builder.query({
      query: () => "/newShops/unpaid/total",
      providesTags: ["Shops"],
    }),

    // Buyurtmani yangilash
    updateShop: builder.mutation({
      query: ({ id, body }) => ({
        url: `/newShops/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ({ id }) => [{ type: "Shops", id }],
    }),

    // Buyurtmani o'chirish
    deleteShop: builder.mutation({
      query: (id) => ({
        url: `/newShops/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shops"],
    }),

    // Materiallarni qo'shish
    addMaterial: builder.mutation({
      query: ({ ShopId, material }) => ({
        url: `/newShops/${ShopId}/materials`,
        method: "POST",
        body: material,
      }),
      invalidatesTags: ({ ShopId }) => [{ type: "Shops", id: ShopId }],
    }),

    // Materialni o'chirish
    deleteMaterial: builder.mutation({
      query: ({ ShopId, materialId }) => ({
        url: `/newShops/${ShopId}/materials/${materialId}`,
        method: "DELETE",
      }),
      invalidatesTags: ({ ShopId }) => [{ type: "Shops", id: ShopId }],
    }),

    getOrdersByisPaid: builder.query({
      query: (q) => "/getshopsbyisPaid?isPaid=" + q,
      providesTags: ["Shops"],
    }),
  }),
});

export const {
  useCreateShopMutation,
  useGetAllShopsQuery,
  useGetShopsByShopQuery,
  useGetUnpaidTotalByShopQuery,
  useGetUnpaidTotalQuery,
  useUpdateShopMutation,
  useDeleteShopMutation,
  useAddMaterialMutation,
  useDeleteMaterialMutation,
  useGetOrdersByisPaidQuery,
} = ShopsApi;
