import { useReducer } from "react";

function reducer(state, { action, payload }) {
    switch(action) {
      case "LOADING": 
        return { ...state, status: "LOADING" };
      case "FAILURE":
        return { ...state, status: "FAILURE", error: payload };
      case "SUCCESS":
        return { ...state, status: "SUCCESS", result: payload };
      default:
        return state;
    }
}

function useLoader(initialState) {
    return useReducer(reducer, initialState);
}

export default useLoader;