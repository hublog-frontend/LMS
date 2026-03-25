import { configureStore } from "@reduxjs/toolkit";
import { companyQuestionListReducer } from "./Slice";

export const reduxStore = configureStore({
  devTools: true,
  reducer: {
    companyquestionlist: companyQuestionListReducer,
  },
});
