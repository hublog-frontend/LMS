import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const companyQuestionListSlice = createSlice({
  name: "companyquestionlist",
  initialState,
  reducers: {
    storeCompanyQuestionList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { storeCompanyQuestionList } = companyQuestionListSlice.actions;

//create reducer
export const companyQuestionListReducer = companyQuestionListSlice.reducer;
