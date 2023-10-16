import React, { createContext, useContext } from "@wordpress/element";

const state = {
	save: false
}

export const SaveOnly = ({ children }): React.Element => {
  if (state.save) return children;
  return <></>;
};

export const EditOnly = ({ children }): React.Element => {
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
