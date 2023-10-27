import { View as Island } from "./$$component$$";

document.querySelectorAll(".wp-block-$$namespace$$-$$slug$$").forEach((element) => {
  const attr = element.getAttribute("data-attributes");
  const attrObj = attr ? JSON.parse(atob(attr)) : {};
	// @ts-ignore
  ReactDOM.hydrateRoot(
    element,
		// @ts-ignore
    React.createElement(Island, { ...attrObj, hydrate: true })
  );
  element.removeAttribute("data-attributes");
});
