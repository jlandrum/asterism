import React from "react";

const state = {
	save: false
}

export const SaveOnly = ({ children }) => {
  if (state.save) return children;
  return <></>;
};

export const EditOnly = ({ children }) => {
  if (!state.save) return children;
  return <></>;
};

export const SwiftState = ({ save, children }) => {
	state.save = save;
	return children;
};

export const useSwiftState = () => {
  return state.save;
};
