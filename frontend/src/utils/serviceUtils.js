import axios from "axios";

export const isCancelError = (error) => axios.isCancel(error);

export const errorHandling = (openAlert, error, callback) => {
  if (!isCancelError(error)) {
    openAlert("Connection error", error.message);
    if (callback) {
      callback();
    }
  }
};
