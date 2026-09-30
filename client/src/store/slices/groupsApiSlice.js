import { apiSlice } from './apiSlice';

export const groupsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGroups: builder.query({
      query: () => '/api/groups',
      providesTags: ['Group'],
    }),
    getGroupById: builder.query({
      query: (id) => `/api/groups/${id}`,
      providesTags: (result, error, id) => [{ type: 'Group', id }],
    }),
    createGroup: builder.mutation({
      query: (data) => ({
        url: '/api/groups',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Group'],
    }),
    addGroupMember: builder.mutation({
      query: ({ groupId, userId }) => ({
        url: `/api/groups/${groupId}/members`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['Group', 'Notification'],
    }),
  }),
});

export const { useGetGroupsQuery, useGetGroupByIdQuery, useCreateGroupMutation, useAddGroupMemberMutation } = groupsApiSlice;
