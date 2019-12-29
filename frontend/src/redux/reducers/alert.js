import { CLOSE_ALERT, OPEN_ALERT } from "../actionTypes";

const initialState = {
  open: false,
  title: "",
  description: "",
};

export default function(state = initialState, action) {
  switch (action.type) {
    case OPEN_ALERT: {
      const { title, description } = action.payload;
      return {
        ...state,
        open: true,
        title,
        description,
      };
    }
    case CLOSE_ALERT: {
      return {
        ...state,
        open: false,
      };
    }
    default:
      return state;
  }
}
