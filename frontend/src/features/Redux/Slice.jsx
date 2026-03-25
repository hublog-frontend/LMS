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

const favoriteCompanyQuestionListSlice = createSlice({
  name: "favoritecompanyquestionlist",
  initialState,
  reducers: {
    storeFavoriteCompanyQuestionList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { storeCompanyQuestionList } = companyQuestionListSlice.actions;
export const { storeFavoriteCompanyQuestionList } =
  favoriteCompanyQuestionListSlice.actions;

//create reducer
export const companyQuestionListReducer = companyQuestionListSlice.reducer;
export const favoriteCompanyQuestionListReducer =
  favoriteCompanyQuestionListSlice.reducer;
