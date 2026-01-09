import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  resumeData: {
    template: "classic",
    themeColor: "#22c55e",
  },
};
export const resumeSlice = createSlice({
  name: "editResume",
  initialState,
  reducers: {
    addResumeData: (state, action) => {
      state.resumeData = {
        ...state.resumeData,
        ...action.payload,
      };
    },
    setTemplate: (state, action) => {
      state.resumeData.template = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { addResumeData, setTemplate } = resumeSlice.actions;

export default resumeSlice.reducer;
