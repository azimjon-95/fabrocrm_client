import { api } from "./api";

export const shopsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getShops: builder.query({
            query: () => '/shops',
            providesTags: ['Shops'],
        }),
        addShop: builder.mutation({
            query: (newShop) => ({
                url: '/shops',
                method: 'POST',
                body: newShop,
            }),
            invalidatesTags: ['Shops'],
        }),
        deleteShop: builder.mutation({
            query: (id) => ({
                url: `/shops/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Shops'],
        }),
    }),
});

export const {
    useGetShopsQuery,
    useAddShopMutation,
    useDeleteShopMutation,
} = shopsApi;
