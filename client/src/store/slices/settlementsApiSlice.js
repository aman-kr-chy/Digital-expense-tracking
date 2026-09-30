import { apiSlice } from './apiSlice';

export const settlementsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addSettlement: builder.mutation({
      query: (data) => ({
        url: '/api/settlements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Dashboard', 'Settlement', 'Expense', 'Notification'], // Refresh payment and notification data
    }),
    getSettlements: builder.query({
      query: () => '/api/settlements',
      providesTags: ['Settlement'],
    }),
  }),
});

export const { useAddSettlementMutation, useGetSettlementsQuery } = settlementsApiSlice;
