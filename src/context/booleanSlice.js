import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isDollar: false, // Default qiymat false
};

const booleanSlice = createSlice({
    name: "boolean",
    initialState,
    reducers: {
        setBoolean: (state, action) => {
            state.isDollar = action.payload;
        },
    },
});

export const { setBoolean } = booleanSlice.actions;
export default booleanSlice.reducer;
