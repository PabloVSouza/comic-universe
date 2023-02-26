import { configureStore } from "@reduxjs/toolkit"

const initialState = {
	loading: false,
	loggedUser: {},
}

const reducer = (state = initialState, action) => {
	if (action.type === "SET_LOADING") {
		return Object.assign({}, state, {
			loading: action.payload.value,
		})
	}

	if (action.type === "SET_USER") {
		return Object.assign({}, state, {
			loggedUser: action.payload,
		})
	}

	if (action.type === "SET_MENUS") {
		return Object.assign({}, state, {
			menuOptions: action.payload,
		})
	}

	if (action.type === "SET_SORTING") {
		return Object.assign({}, state, {
			sorting: action.payload,
		})
	}

	if (action.type === "RESET_STORE") {
		state = initialState
	}

	return state
}

const store = configureStore({ reducer })

export default store
