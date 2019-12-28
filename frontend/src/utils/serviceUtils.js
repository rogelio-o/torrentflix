import axios from "axios";

export const isCancelError = (error) => axios.isCancel(error);
