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
