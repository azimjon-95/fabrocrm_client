import { api } from "./api";

export const attendanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllAttendance: builder.query({
      query: () => "/attendance/all",
    }),
    getAttendanceByDate: builder.query({
      query: (date) => `/attendance/date/${date}`,
    }),
    getMonthlyAttendance: builder.query({
      query: ({ year, month }) => `/attendance/monthly/${year}/${month}`,
    }),
    createAttendance: builder.mutation({
      query: (attendanceData) => ({
        url: "/attendance/create",
        method: "POST",
        body: attendanceData,
      }),
    }),
    updateAttendance: builder.mutation({
      query: (updatedData) => ({
        url: `/attendance/update`,
        method: "POST",
        body: updatedData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllAttendanceQuery,
  useGetAttendanceByDateQuery,
  useGetMonthlyAttendanceQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
} = attendanceApi;
