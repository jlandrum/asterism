// TODO: This REALLY needs to be split into multiple components

import React, {
  createContext,
  useState,
	useContext,
  useEffect,
  useMemo,
	useRef
} from "@wordpress/element";
import { EditOnly } from "../RenderScope/RenderScope";
import {
  Panel,
  PanelBody,
  PanelRow,
  SelectControl,
  Button,
	Slot,
	Fill,
	Modal,
	ToolbarButton,
	TextControl,
	Flex,
	FormTokenField,
	__experimentalNumberControl as NumberControl,
  __experimentalGrid as Grid,
} from "@wordpress/components";
import { BlockControls } from "@wordpress/block-editor";
import { select } from "@wordpress/data";
import { chevronUp, chevronDown, unseen, seen, pin, edit, check, close, blockMeta, plus } from "@wordpress/icons";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import { useFocusManager } from "../FocusManager/FocusManager";
import Filters from "./Filters";

type Features = 'filters' | 'pin';

interface ContentPreview {
	/** The query to execute */
	query: ContentQuery;
	/* The results of the query */
	results: any[];
}

interface ContentQuery {
	/** The post type to query */
  postType: string[];
	/** The querying method */
	method?: 'exclusive' | 'inclusive';
	/** The ordering method */
	order?: 'newest' | 'oldest' | 'az' | 'za' | 'random';
	/** The max number of results */
	limit?: number;
	/** Content to isolate for inclusion/exclusion */
	isolated?: number[];
	/** Filters to apply to the query */
	filters?: any[];
	/** Fixed IDs */
	fixed?: number[];
}

interface ContentInputProps {
	/** Any values set will be fixed (Cannot be changed within Gutenberg) */
	fixedValue?: Partial<ContentQuery>;
  /** Filters the available items */
	allowed?: Features[];
	/** The current ContentQuery value */
  value?: ContentQuery;
	/** If true, the UI focus will be on selecting content directly opposed to building a query */
	picker?: boolean;
  /** The children to render, which will also provide a context in which
   *  the result of the query can be accessed.
   */
	children?: any;
	/** If specified, the editor will show in a popup with a button
	 * provided into the given slot.
	 */
	useSlot?: string;
	/** If true, the button will show in the block toolbar */
	useBlockToolbar?: boolean;
	/** Extra columns to display */
	extraColumns?: string[];
  /** Called when the query has updated. */
  onValueChange?: (value: ContentQuery) => void;
	/** Additional props will be handed down */
  [props: string]: any;
}

const ContentInputContext = createContext<ContentPreview>({
	query: { postType: ["pages"] },
	results: [],
});

const _ContentInput = ({
	useSlot,
	useEditorToolbar = true,
	fixedValue,
  value,
	extraColumns = [],
  children,
	allowed = undefined,
	picker = false,
  onValueChange,
  ...props
}: ContentInputProps) => {
  const [queryPreview, setQueryPreview] = useState<any>([]);
  const [queryRender, setQueryRender] = useState<any>([]);
	const [showEditor, setShowEditor] = useState(false);
	const [search, setSearch] = useState('');
	const [searchRaw, setSearchRaw] = useState<string>('');
	const searchValDebounce = useRef<number|NodeJS.Timeout>(-1);
	const [showButton, setShowButton] = useState(false);
	const [postTypes, setPostTypes] = useState<any[]>([]);

	const focusListener = useFocusManager(
		() => setShowButton(false),
		() => setShowButton(true),
		[], true
	);

	useEffect(() => {
		clearTimeout(searchValDebounce.current);
		searchValDebounce.current = setTimeout(() => {
			setSearch(searchRaw);
		}, 1000);
	}, [searchRaw]);

  const query = useMemo(
    () => ({
      method: picker ? "exclusive" as const : "inclusive" as const,
      order: "newest" as const,
      limit: 0,
      filters: [],
      ...value,
      // Addresses change to array
      postType: value?.postType ? 
			(typeof value.postType === "string" ? [value.postType] : value.postType)
			: ["pages"],
      ...fixedValue,
    }),
    [value]
  );

	const allows = (feature: string) => {
		if (!allowed) return true;
		return allowed.includes(feature as Features);
	}

  const setQuery = (newQuery: ContentQuery) => {
    onValueChange?.(newQuery);
  };

	// Ensure the initial value is set
	useEffect(() => {
		if (!value || !value.postType) {
			onValueChange?.(query);
		}
	}, []);

	useEffect(() => {
		apiFetch<any>({ path: "/wp/v2/types" })
			.then(postTypes => Object.entries(postTypes).map(([key, value]) => ({ slug: key, ...value as object })))
			.then(setPostTypes as any);
	}, []);

  //Run the query and get the results
	const runQuery = (search: string | undefined = undefined, mods: object = {}) => {
		const args = {
			...{...query, ...mods},
			...(search ? { search } : {}),
		};

		return apiFetch<any[]>({
		 	path: addQueryArgs(`/ast/v1/query`, { ...args }),
		 	method: "GET",
		})
	}

  useEffect(() => {
		(async () => {
			let queryPreview: any[] = await runQuery(search, { method: "inclusive", isolated: []  })
			if (!queryPreview) return;
			setQueryPreview(queryPreview);

			let queryRender = await runQuery();
			if (!queryRender) return;
			setQueryRender(queryRender);
		})();
  }, [postTypes, query.order, query.postType, query.filters, search]);

	const excludeState = (postId: number): [string, any] => {
		if (query.method === 'exclusive') {
			return query.isolated?.includes(postId)
        ? ["Exclude from results", seen]
        : ["Include in results", unseen];
		} else {
			return query.isolated?.includes(postId)
        ? ["Include in results", unseen]
        : ["Exclude from results", seen];
		}
	}

	const lockedState = (postId: number): [string, number, boolean] => {
		return query.fixed?.find((it: number) => it === postId)
      ? ["Unpin", 1, true]
      : ["Pin", 0.4, false];
	}

	const toggleIsolation = (postId: number) => {
		if (query.isolated?.includes(postId)) {
			setQuery({ ...query, isolated: query.isolated.filter((it) => it !== postId) });
		} else {
			setQuery({ ...query, isolated: [...(query.isolated || []), postId] });
		}
	}

	const toggleFixed = (postId: number) => {
		if (query.fixed?.find((it: number) => it === postId)) {
			setQuery({ ...query, fixed: query.fixed.filter((it) => it !== postId)});
		} else {
			setQuery({
        ...query,
        fixed: [...(query.fixed || []), postId],
      });
		}
	}

	const moveItem = (index: number, direction: number) => {
		if (index + direction < 0 || (index + direction) >= (query.fixed ? query.fixed.length : -1)) return;
		const newFixed = [...query?.fixed || []];
		const temp = newFixed[index];
		newFixed[index] = newFixed[index + direction];
		newFixed[index + direction] = temp;
		setQuery({ ...query, fixed: newFixed });
	}

	const slot = props.useSlot || 'content-input-slot';

  return (
    <div className="content-input" {...props} {...focusListener.props}>
      {useEditorToolbar && (
        <BlockControls controls={{}}>
          <Slot name={slot} />
        </BlockControls>
      )}

      {showButton && (
        <Fill name={slot}>
          <ToolbarButton
            onClick={() => setShowEditor(true)}
            icon={blockMeta}
            label="Show Content Query Editor"
          />
        </Fill>
      )}

      {showEditor && (
        <Modal
          isFullScreen={!picker}
          onRequestClose={() => {
            setShowEditor(false), setSearch("");
          }}
          title={picker ? "Content Picker" : "Query Editor"}
          className={
            picker
              ? "content-input-modal content-input-modal--picker"
              : "content-input-modal"
          }
        >
          <Panel>
            {!fixedValue?.postType && !picker && (
              <PanelBody title="Basic Settings">
                {!fixedValue?.postType && (
                  <PanelRow>
                    {picker ? (
                      <SelectControl
                        value={query?.postType?.[0]}
                        onChange={(value) =>
                          setQuery({ ...query, postType: [value] })
                        }
                        options={postTypes.map((postType: any) => ({
                          label: postType.name,
                          value: postType.slug,
                        }))}
                        label="Post Type"
                      />
                    ) : (
                      <FormTokenField
                        value={query?.postType}
                        onChange={(value) =>
                          setQuery({ ...query, postType: value as string[] })
                        }
                        suggestions={postTypes.map(
                          (postType: any) => postType.slug
                        )}
                        label="Post Type"
                      />
                    )}
                  </PanelRow>
                )}
                {!fixedValue?.order && !picker && (
                  <PanelRow>
                    <SelectControl
                      value={query?.order}
                      // @ts-ignore
                      onChange={(value) => setQuery({ ...query, order: value })}
                      options={[
                        { label: "Newest to Oldest", value: "newest" },
                        { label: "Oldest to Newest", value: "oldest" },
                        { label: "A -> Z", value: "az" },
                        { label: "Z -> A", value: "za" },
                        { label: "Random", value: "random" },
                        // TODO: Add custom ordering by field
                      ]}
                      label="Order By"
                    />
                  </PanelRow>
                )}
                {!fixedValue?.method && !picker && (
                  <PanelRow>
                    <SelectControl
                      value={query?.method}
                      // @ts-ignore
                      onChange={(value) =>
                        setQuery({ ...query, method: value })
                      }
                      options={[
                        { label: "Exclusive", value: "exclusive" },
                        { label: "Inclusive", value: "inclusive" },
                      ]}
                      help="Exclusive will only show posts that have been flagged to be included. Inclusive will show all posts that haven't explicitly been excluded."
                      label="Query Mode"
                    />
                  </PanelRow>
                )}
                {!fixedValue?.limit && (
                  <PanelRow>
                    <NumberControl
                      value={query?.limit}
                      onChange={(value) =>
                        setQuery({ ...query, limit: parseInt(value || "0") })
                      }
                      label="Limit"
                      min={0}
                      max={100}
                      help="Limits the total number of items; use 0 for no limit."
                    />
                  </PanelRow>
                )}
              </PanelBody>
            )}
            {allows("filters") && !picker && (
              <Filters
                postTypes={query.postType}
                filters={query.filters}
                onChange={(filters) => setQuery({ ...query, filters })}
              />
            )}
            <PanelBody
              title={picker ? undefined : `Results (${queryPreview.length})`}
            >
              <PanelRow>
                <TextControl
                  label={picker ? `Find Content` : `Filter Results`}
                  value={searchRaw}
                  help={
                    picker
                      ? undefined
                      : "Filters the result table to help find a specific entry; does not affect the query."
                  }
                  onChange={setSearchRaw}
                />
              </PanelRow>
              <PanelRow>
                <table
                  className="results"
                  style={{
                    width: "100%",
                    gridTemplateColumns: `auto 1fr ${extraColumns.map(
                      () => "1fr"
                    )} auto`,
                  }}
                >
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Title</th>
                      {extraColumns.map((it) => (
                        <th>{it}</th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queryPreview.map((it: any, index: number) => (
                      <tr
                        key={it.id}
                        className={(query.limit || 100) < index + 1 ? "" : ""}
                      >
                        <td>
                          {postTypes.find((type) => it.type === type.slug)
                            ?.name || it.slug}
                        </td>
                        <td
                          dangerouslySetInnerHTML={{
                            __html: it.title.rendered,
                          }}
                        />
                        {extraColumns.map((col) => (
                          <td>{it[col] || it.acf?.[col] || ""}</td>
                        ))}
                        <td>
                          {lockedState(it.id)[2] && [
                            <Button
                              size="small"
                              icon={chevronUp}
                              label="Move Up"
                              onClick={() => moveItem(index || 0, -1)}
                            />,
                            <Button
                              size="small"
                              icon={chevronDown}
                              label="Move Down"
                              onClick={() => moveItem(index || 0, 1)}
                            />,
                          ]}
                          {picker ? (
                            <>
                              <Button
                                size="small"
                                className="content-input-modal__select"
                                icon={
                                  query.fixed?.includes(it.id)
                                    ? check
                                    : undefined
                                }
                                label="Select"
                                onClick={() => {
                                  toggleFixed(it.id);
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <Button
                                size="small"
                                onClick={() => toggleIsolation(it.id)}
                                icon={excludeState(it.id)[1]}
                                label={`${excludeState(it.id)[0]}`}
                              />
                              {allows("pin") && (
                                <Button
                                  size="small"
                                  icon={pin}
                                  style={{ opacity: lockedState(it.id)[1] }}
                                  label={lockedState(it.id)[0]}
                                  onClick={() => toggleFixed(it.id)}
                                />
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </PanelRow>
            </PanelBody>
          </Panel>
        </Modal>
      )}
      <ContentInputContext.Provider
        value={{
          query,
          results: queryRender,
        }}
      >
        {typeof children === "function" ? children(queryRender) : children}
      </ContentInputContext.Provider>
    </div>
  );
};

/**
 * A complex component with multiple uses. It can be used in place of Query Loop,
 * or it can be used as a mechanism to select content for use in other components.
 */
export const ContentInput = (props: ContentInputProps) => {
  return (
    <EditOnly>
      <_ContentInput {...props} />
    </EditOnly>
  );
};


export const useContentInput = () => {
	return useContext(ContentInputContext);
}

export default ContentInput;
