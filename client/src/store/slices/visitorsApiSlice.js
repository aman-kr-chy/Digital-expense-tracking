import { apiSlice } from './apiSlice';

export const visitorsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    trackWebsiteVisit: builder.mutation({
      query: () => ({
        url: '/api/visitors/visit',
        method: 'POST',
      }),
    }),
  }),
});

export const { useTrackWebsiteVisitMutation } = visitorsApiSlice;
