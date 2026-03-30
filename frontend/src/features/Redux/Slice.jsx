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

let companyQuestionSearchValue = "";
const companyQuestionSearchValueSlice = createSlice({
  name: "companyquestionsearchvalue",
  initialState: companyQuestionSearchValue,
  reducers: {
    storeCompanyQuestionSearchValue(state, action) {
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

let favoriteCompanyQuestionSearchValue = "";
const favoriteCompanyQuestionSearchValueSlice = createSlice({
  name: "favoritecompanyquestionsearchvalue",
  initialState: favoriteCompanyQuestionSearchValue,
  reducers: {
    storefavoriteCompanyQuestionSearchValue(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { storeCompanyQuestionList } = companyQuestionListSlice.actions;
export const { storeCompanyQuestionSearchValue } =
  companyQuestionSearchValueSlice.actions;
export const { storeFavoriteCompanyQuestionList } =
  favoriteCompanyQuestionListSlice.actions;
export const { storefavoriteCompanyQuestionSearchValue } =
  favoriteCompanyQuestionSearchValueSlice.actions;

//create reducer
export const companyQuestionListReducer = companyQuestionListSlice.reducer;
export const companyQuestionSearchValueReducer =
  companyQuestionSearchValueSlice.reducer;
export const favoriteCompanyQuestionListReducer =
  favoriteCompanyQuestionListSlice.reducer;
export const favoriteCompanyQuestionSearchValueReducer =
  favoriteCompanyQuestionSearchValueSlice.reducer;
