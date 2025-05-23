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
        updateShop: builder.mutation({
            query: (id, body) => ({
                url: `/shops/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Shops'],
        }),
    }),
});

export const {
    useGetShopsQuery,
    useAddShopMutation,
    useDeleteShopMutation,
    useUpdateShopMutation
} = shopsApi;
