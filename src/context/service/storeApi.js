import { api } from "./api";

export const storeApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAllStores: builder.query({
            query: () => "/store/all",
        }),
        createStore: builder.mutation({
            query: (newStore) => ({
                url: "/store/create",
                method: "POST",
                body: newStore,
            }),
        }),
        updateStore: builder.mutation({
            query: ({ id, updatedData }) => ({
                url: `/store/update/${id}`,
                method: "PUT",
                body: updatedData,
            }),
        }),

        deleteStore: builder.mutation({
            query: (id) => ({
                url: `/store/delete/${id}`,
                method: "DELETE",
            }),
        }),
        // get by id
        getStoreByCustomerId: builder.query({
            query: (id) => `/store/byId/${id}`, // Endpoint to'g'ri tuzatildi
        }),

        getStoreByCategory: builder.query({
            query: (category) => `/store/category/${category}`,
        }),

        decrementQuantity: builder.mutation({
            query: (id) => ({
                url: `/store/decrement/${id}`,
                method: "PUT",
            }),
        }),

        getStockHistory: builder.query({
            query: () => "/store/history", // Ombor tarixi
        }),

        updateManyStores: builder.mutation({
            query: (updates) => ({
                url: "/store/update-many",
                method: "POST",
                body: updates,
            }),
            invalidatesTags: ["Store"], // Ma'lumot yangilanganidan keyin cache ni tozalash
        }),
    }),
});

export const {
    useGetAllStoresQuery,
    useDeleteStoreMutation,
    useUpdateStoreMutation,
    useGetStoreByCategoryQuery,
    useDecrementQuantityMutation,
    useCreateStoreMutation,
    useGetStoreByCustomerIdQuery,
    useGetStockHistoryQuery,
    useUpdateManyStoresMutation
} = storeApi;



