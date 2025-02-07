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
    }),
});

export const {
    useGetAllStoresQuery,
    useDeleteStoreMutation,
    useUpdateStoreMutation,
    useGetStoreByCategoryQuery,
    useDecrementQuantityMutation,
    useCreateStoreMutation,
    useGetStockHistoryQuery
} = storeApi;





