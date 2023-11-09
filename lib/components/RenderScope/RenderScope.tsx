import React from "react";

/**
 * A utility element that renders only if the components within are being saved.
 */
export class SaveOnly extends React.Component<{

	/** Any elements here will only be rendered during a save */
	children: any;
}> {
	render() {
		// @ts-ignore As far as TS is aware, this isn't available - and that's fine
		const hooksAvailable = !!this._reactInternals;
		if (hooksAvailable) return <></>
		return this.props.children
	}
}

/**
 * A utility element that renders only if the components within are being edited.
 */
export class EditOnly extends React.Component<{

	/** Any elements here will only render during an edit */
  children: any;
}> {
  render() {
    // @ts-ignore As far as TS is aware, this isn't available - and that's fine
    const hooksAvailable = !!this._reactInternals;
    if (hooksAvailable) return this.props.children;
    return <></>;
  }
}

/**
 * A utility wrapper that renders only if the components within are being saved.
 * It adds a conditional wrapper around the children, so it can be used with
 * components that require a wrapper.
 */
export class EditOnlyWrapper extends React.Component<{

	/** Any elements here will only be rendered during a save */
	children: any;

	/** The wrapper component to use
	 * @default "div"
	 */
	node: string;

	/** Any additional props to pass to the wrapper */
	[a:string]: any;
}> {
  render() {
		const { node = "div", children, ...attrs} = this.props;
    const Node = node;

		// @ts-ignore As far as TS is aware, this isn't available - and that's fine
    const hooksAvailable = !!this._reactInternals;
		// @ts-ignore Using strings is normal in this case in React but I'm unsure of how to fix the typing
    if (hooksAvailable) return <Node {...attrs}>{children}</Node>;
    return <>{children}</>;
  }
}
