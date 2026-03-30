import { configureStore } from "@reduxjs/toolkit";
import {
  companyQuestionListReducer,
  companyQuestionSearchValueReducer,
  favoriteCompanyQuestionListReducer,
  favoriteCompanyQuestionSearchValueReducer,
} from "./Slice";

export const reduxStore = configureStore({
  devTools: true,
  reducer: {
    companyquestionlist: companyQuestionListReducer,
    companyquestionsearchvalue: companyQuestionSearchValueReducer,
    favoritecompanyquestionlist: favoriteCompanyQuestionListReducer,
    favoritecompanyquestionsearchvalue:
      favoriteCompanyQuestionSearchValueReducer,
  },
});
