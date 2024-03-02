import { MESSAGES } from "./constants";
import { IDataError } from "./auth";
export const errorMessage = (e) => {
  //console.log(e.response.data);
  return e.response?.data?.msg ? e.response.data.msg : MESSAGES.UNKNOWN_ERROR;
};

export const componentsErrors = (e): Array<IDataError> => {
  return e.response?.data?.errors ? e.response.data.errors : [];
};
