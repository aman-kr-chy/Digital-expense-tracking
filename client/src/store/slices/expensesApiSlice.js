import { apiSlice } from './apiSlice';

export const expensesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: () => '/api/expenses',
      providesTags: ['Expense'],
    }),
    addExpense: builder.mutation({
      query: (data) => ({
        url: '/api/expenses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Expense', 'Dashboard'],
    }),
  }),
});

export const { useGetExpensesQuery, useAddExpenseMutation } = expensesApiSlice;
