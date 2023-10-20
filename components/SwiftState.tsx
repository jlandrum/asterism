import React from "react";

export class SaveOnly extends React.Component<{
	children: any;
}> {
	render() {
		const hooksAvailable = this._reactInternals;
		if (hooksAvailable) return <></>
		return this.props.children
	}
}

export class EditOnly extends React.Component<{
  children: any;
}> {
  render() {
    const hooksAvailable = this._reactInternals;
		if (hooksAvailable) return this.props.children
    return <></>
  }
}
