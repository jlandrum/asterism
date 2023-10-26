import React from "react";

/**
 * A utility element that renders only if the components within are being saved.
 */
export class SaveOnly extends React.Component<{
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
 * A utility element that renders only if the components within are being edited.
 */
export class EditOnlyWrapper extends React.Component<{
  children: any;
	node: string;
	[a:string]: any;
}> {
  render() {
		const { node, children, ...attrs} = this.props;
    const Node = node;

		// @ts-ignore As far as TS is aware, this isn't available - and that's fine
    const hooksAvailable = !!this._reactInternals;
		// @ts-ignore Using strings is normal in this case in React but I'm unsure of how to fix the typing
    if (hooksAvailable) return <Node {...attrs}>{children}</Node>;
    return <>{children}</>;
  }
}
