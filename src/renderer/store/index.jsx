// import merge from "lodash.merge";

// const initialState = {
//   loading: false,
//   loggedUser: {},
//   currentComic: {},
//   downloadQueue: [],
//   downloadedChapters: [],
// };

// const { on, invoke } = window.electron.ipcRenderer;

// on("loading", (event, param) => {
//   store.dispatch({ type: "SET_LOADING", payload: { value: param } });
// });

// const reducer = async (state = initialState, action) => {
//   if (action.type === "SET_LOADING") {
//     return Object.assign({}, state, {
//       loading: action.payload.value,
//     });
//   }

//   if (action.type === "SET_CURRENT_COMIC") {
//     return Object.assign({}, state, {
//       currentComic: action.payload,
//     });
//   }

//   if (action.type === "SET_DOWNLOAD_QUEUE") {
//     return Object.assign({}, state, {
//       downloadQueue: action.payload,
//     });
//   }

//   if (action.type === "RESET_STORE") {
//     state = initialState;
//   }

//   if (action.type === "SET_DOWNLOADED_CHAPTERS") {
//     return Object.assign({}, state, {
//       downloadedChapters: action.payload,
//     });
//   }

//   if (action.type === "GET_COMIC") {
//     // store.dispatch({
//     //   type: "SET_CURRENT_COMIC",
//     //   payload: {},
//     // });
//     // const updatedData = await invoke("getMangaData", action.slug);
//     // const dbData = await invoke("db-find", {
//     //   table: "Manga",
//     //   query: {
//     //     slug: action.slug,
//     //   },
//     // });
//     // store.dispatch({ type: "SET_CURRENT_COMIC", payload: dbData[0] });
//     // if (dbData.length > 0) {
//     //   const data = merge(updatedData, dbData[0]);
//     //   // store.dispatch({ type: "UPDATE_DOWNLOADED_CHAPTERS" });
//     // } else {
//     //   const data = merge(updatedData, state.currentComic);
//     //   store.dispatch({ type: "SET_CURRENT_COMIC", payload: data });
//     // }
//   }

//   if (action.type === "UPDATE_DOWNLOADED_CHAPTERS") {
//     invoke("db-find", {
//       table: "Chapter",
//       query: {
//         manga_id: state.currentComic._id,
//       },
//     }).then((res) => {
//       store.dispatch({ type: "SET_DOWNLOADED_CHAPTERS", payload: res });
//     });
//   }

//   return state;
// };

// const middleware = (getDefaultMiddleware) =>
//   getDefaultMiddleware({ serializableCheck: false });

// const store = configureStore({ reducer, middleware });

// export default store;
