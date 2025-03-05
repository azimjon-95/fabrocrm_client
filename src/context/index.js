import { configureStore } from "@reduxjs/toolkit";
import { api } from "./service/api";
import booleanReducer from './booleanSlice';

export default configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    boolean: booleanReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
