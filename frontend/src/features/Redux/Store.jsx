import { configureStore } from "@reduxjs/toolkit";
import {
  companyQuestionListReducer,
  favoriteCompanyQuestionListReducer,
} from "./Slice";

export const reduxStore = configureStore({
  devTools: true,
  reducer: {
    companyquestionlist: companyQuestionListReducer,
    favoritecompanyquestionlist: favoriteCompanyQuestionListReducer,
  },
});
