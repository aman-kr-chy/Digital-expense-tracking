import { apiSlice } from './apiSlice';

export const friendsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFriends: builder.query({
      query: () => '/api/friends',
      providesTags: ['Friend'],
    }),
    getUsers: builder.query({
      query: (keyword = '') => `/api/users?keyword=${keyword}`,
      providesTags: ['User'],
    }),
    sendFriendRequest: builder.mutation({
      query: (data) => ({
        url: '/api/friends/request',
        method: 'POST',
        body: data,
      }),
    }),
    getFriendRequests: builder.query({
      query: () => '/api/friends/requests',
      providesTags: ['Friend'],
    }),
    updateFriendRequest: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/friends/request/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Friend'],
    }),
    inviteFriend: builder.mutation({
      query: (data) => ({
        url: '/api/friends/invite',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { 
  useGetFriendsQuery, 
  useGetUsersQuery, 
  useSendFriendRequestMutation,
  useGetFriendRequestsQuery,
  useUpdateFriendRequestMutation,
  useInviteFriendMutation
} = friendsApiSlice;
