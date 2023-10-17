import { useBlockProps } from '@wordpress/block-editor';
import { SwiftState } from 'wpasterism/components/SwiftState';
import $$component$$ from "./$$component$$.tsx";

export default function save({attributes}: any) {
	return (
    <SwiftState save={true}>
      <$$component$$ blockProps={useBlockProps.save()} attributes={attributes} />
    </SwiftState>
  );
}
