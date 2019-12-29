import { CLOSE_ALERT, OPEN_ALERT } from "./actionTypes";

export const openAlert = (title, description) => ({
  type: OPEN_ALERT,
  payload: {
    title,
    description,
  },
});

export const closeAlert = () => ({
  type: CLOSE_ALERT,
});
