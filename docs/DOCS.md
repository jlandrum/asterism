# Components

## [ImageInput](../lib/components/ImageInput/ImageInput.tsx)

A component that represents a selectable image.

**since**: 0.5.0



### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| label | string | Image | Label for the image input. |
| value | Media |  | The current value of the image input. |
| useSlot | string |  | If provided, the image select button will appear in the given slot.<br/>Otherwise, the icon will appear centered and on top of the image input |
| useBlockControls | boolean |  | If true, the image select button will appear in the block controls. |
| className | string |  | The class name to apply to the image. |
| style | CSSProperties |  | The style to apply to the image. |
| onChange | (value: Media) => void |  | The callback to fire when the image is changed. |

## [SaveOnly](../lib/components/RenderScope/RenderScope.tsx)

A utility element that renders only if the components within are being saved.



## [EditOnly](../lib/components/RenderScope/RenderScope.tsx)

A utility element that renders only if the components within are being edited.



## [EditOnlyWrapper](../lib/components/RenderScope/RenderScope.tsx)

A utility wrapper that renders only if the components within are being saved.
It adds a conditional wrapper around the children, so it can be used with
components that require a wrapper.



## [ContentInput](../lib/components/ContentInput/ContentInput.tsx)

A complex component with multiple uses. It can be used in place of Query Loop,
or it can be used as a mechanism to select content for use in other components.



### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| fixedValue | ContentQuery |  | Any values set will be fixed (Cannot be changed within Gutenberg) |
| value | ContentQuery |  | Filters the available items |
| children | any |  | The children to render, which will also provide a context in which<br/>the result of the query can be accessed. |
| useSlot | string |  | If specified, the editor will show in a popup with a button<br/>provided into the given slot. |
| useBlockToolbar | boolean |  | If true, the button will show in the block toolbar |
| onValueChange | (value: ContentQuery) => void |  | Called when the query has updated. |

## [InnerBlocks](../lib/components/InnerBlocks/InnerBlocks.tsx)





### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| allowedBlocks | string[] |  |  |
| renderAppender | ComponentType |  | A 'render prop' function that can be used to customize the block's appender. |
| template | TemplateArray |  | The template is defined as a list of block items. Such blocks can have predefined<br/>attributes, placeholder, content, etc. Block templates allow specifying a default initial<br/>state for an InnerBlocks area.<br/><br/>See {@link https://github.com/WordPress/gutenberg/blob/master/docs/designers-developers/developers/block-api/block-templates.md } |
| templateInsertUpdatesSelection | boolean |  | If `true` when child blocks in the template are inserted the selection is updated.<br/>If `false` the selection should not be updated when child blocks specified in the template are inserted.<br/>@defaultValue true |
| templateLock | EditorTemplateLock |  | Template locking allows locking the `InnerBlocks` area for the current template.<br/><br/>- `'all'` — prevents all operations. It is not possible to insert new blocks. Move existing blocks or delete them.<br/>- `'insert'` — prevents inserting or removing blocks, but allows moving existing ones.<br/>- `false` — prevents locking from being applied to an `InnerBlocks` area even if a parent block contains locking.<br/><br/>If locking is not set in an `InnerBlocks` area: the locking of the parent `InnerBlocks` area is used.<br/><br/>If the block is a top level block: the locking of the Custom Post Type is used. |

## [CaptureFocus](../lib/components/FocusManager/FocusManager.tsx)

A component that captures focus events and calls the provided callbacks.

For more details, see {@link useFocusManager}.

**returns**: ReactComponent - The component to render



## [NestedComponents](../lib/components/NestedComponents/NestedComponents.tsx)

A utility element that handles adding/removing children
without the use of Gutenberg blocks. Useful for blocks
that wish to have more finite control over children.

**param**: props.className - The class name for the component
props.value - The object that holds the data for the nested components
props.children - The component to render for each child
props.emptyObject - The object to clone when adding a new child
props.slotName - Creates a slot allowing items to be hoisted into the toolbar. 
  The slot name will be appended with the index of the child and
and provided to the children as a prop.
props.onChange - The function to call when the children change



### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| value | T[] |  | The nested content |
| emptyObject | T | {} as T | When adding a new item, this object will be used to model the new item's defaults |
| className | string |  | @inheritdoc |
| slotName | string |  | If provided, gives the slots an explicit name. A slot which matches the name <br/>will exist at the end of the toolbar, and a numbered slot (eg., slotName_#) <br/>for every item |
| horizontal | boolean |  | If set, the buttons will reflect a horizontal layout |
| maxItems | number |  | Limits the maximum number of items that can be added |
| element | string |  | Overrides the base element to use |
| carousel | boolean |  | If true, the individual items will no longer have their own toolbar. Instead,<br/>only one item will be displayed and any toolbar items hoisted into the nested<br/>toolbar will appear in the main toolbar. |
| onChange | (value: T[]) => void |  | A callback that sends the most current version of the data |
| children | (props: ChildProps<T>) => React.Element |  | @inheritdoc |

## [LiveTextInput](../lib/components/LiveTextInput/LiveTextInput.tsx)

A inline text input that gives the user an indication that the text is editable.

The children passed will be rendered as-is when the block is saved. When the block is
being edited, the children will be rendered in a textarea that automatically resizes
to fit the content.



### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| value | string | LiveTextValue |  | The current value of the text input. |
| className | string |  | The class name to apply to the text input. |
| onChange | (value: string, url?: Link) => void |  | Called when the value changes. |
| children | React.Element |  | The final rendered output should exist as the child. |
| useSlot | string |  | If you want to use a custom toolbar, you can pass the slot name here. |
| asLink | boolean |  | If true, a link icon will be shown in the toolbar. |
| allowLineBreaks | boolean |  | If you are handling line breaks (eg., setting white-space: pre-wrap), <br/>this can be set to true. |



# Hooks

## [useFocusManager](../lib/components/FocusManager/FocusManager.tsx)

Watches for clicks outside of a target element. Follows the React 
tree, allowing for nested click detectors to work across portals.

To use, create an instance of the hook with the callback functions,
then on the target element use {...hookInstance.props}.

**param**: ref The target element to watch for touch events

**returns**: An object containing the ref and props to apply to the target element.



