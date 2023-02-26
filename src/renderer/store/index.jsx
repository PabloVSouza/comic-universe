import { configureStore } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  loggedUser: {},
  currentComic: null,
  downloadQueue: [],
};

const reducer = (state = initialState, action) => {
  if (action.type === "SET_LOADING") {
    return Object.assign({}, state, {
      loading: action.payload.value,
    });
  }

  if (action.type === "SET_CURRENT_COMIC") {
    return Object.assign({}, state, {
      currentComic: action.payload,
    });
  }

  if (action.type === "SET_DOWNLOAD_QUEUE") {
    return Object.assign({}, state, {
      downloadQueue: action.payload,
    });
  }

  if (action.type === "RESET_STORE") {
    state = initialState;
  }

  return state;
};

const store = configureStore({ reducer });

export default store;
