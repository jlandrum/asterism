import React, {
  createContext,
  useState,
	useContext,
  useEffect,
  useMemo,
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
	__experimentalNumberControl as NumberControl,
  __experimentalGrid as Grid,
} from "@wordpress/components";
import { BlockControls } from "@wordpress/block-editor";
import { select } from "@wordpress/data";
import { chevronUp, chevronDown, unseen, seen, pin, edit, blockMeta } from "@wordpress/icons";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";

interface ContentPreview {
	/** The query to execute */
	query: ContentQuery;
	/* The results of the query */
	results: any[];
}

interface ContentQuery {
	/** The post type to query */
  postType: string;
	/** The querying method */
	method?: 'exclusive' | 'inclusive';
	/** The ordering method */
	order?: 'newest' | 'oldest' | 'az' | 'za' | 'random';
	/** The max number of results */
	limit?: number;
	/** Content to isolate for inclusion/exclusion */
	isolated?: number[];
	/** Fixed IDs */
	fixed?: number[];
}

interface ContentInputProps {
	/** Any values set will be fixed (Cannot be changed within Gutenberg) */
	fixedValue?: ContentQuery;
  /** Filters the available items */
  value?: ContentQuery;
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
  /** Called when the query has updated. */
  onValueChange?: (value: ContentQuery) => void;
	/** Additional props will be handed down */
  [props: string]: any;
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const ContentInputContext = createContext<ContentPreview>({
	query: { postType: "pages" },
	results: [],
});

const _ContentInput = ({
	useSlot,
	useEditorToolbar = true,
	fixedValue,
  value,
  children,
  onValueChange,
  ...props
}: ContentInputProps) => {
  const [queryPreview, setQueryPreview] = useState<any>([]);
	const [showEditor, setShowEditor] = useState(false);

  const query = useMemo(
    () => ({
      postType: "pages",
			method: "inclusive" as const,
			order: "newest" as const,
			limit: 0,
      ...value,
			...fixedValue,
    }),
    [value]
  );

	// Ensure the initial value is set
	useEffect(() => {
		if (!value || !value.postType) {
			onValueChange?.(query);
		}
	}, []);

  const postTypes = select("core").getPostTypes({ per_page: -1 }) || [];

  const setQuery = (newQuery: ContentQuery) => {
    onValueChange?.(newQuery);
  };

  //Run the query and get the results
  useEffect(() => {
    const restEndpoint = postTypes.find(
      (it: any) => it.slug === query.postType
    )?.rest_base;
    apiFetch({
      path: addQueryArgs(`/wp/v2/${restEndpoint}`, {
        per_page: -1,
        order:
          query.order === "az" || query.order === "newest" ? "asc" : "desc",
        orderby:
          query.order === "az" || query.order === "za" ? "title" : "date",
      }),
      method: "GET",
    })
      .then((data) => {
        setQueryPreview(query.order === 'random' ? shuffleArray(data as any[]) : data);
      })
      .catch((e) => {
        console.error(e);
        setQueryPreview([]);
      });
  }, [postTypes, query.order, query.postType]);

	const excludeState = (postId: number): [string, any] => {
		if (query.method === 'exclusive') {
			return query.isolated?.includes(postId)
        ? ["exclude", seen]
        : ["include", unseen];
		} else {
			return query.isolated?.includes(postId)
        ? ["include", unseen]
        : ["exclude", seen];
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
			setQuery({ ...query, fixed: query.fixed.filter((it) => it !== postId) });
		} else {
			setQuery({ ...query, fixed: [...(query.fixed || []), postId] });
		}
	}

	const sortItems = () => {
		if (queryPreview.length === 0) return [];
		return (
      query.fixed?.map?.((it: number) =>
        queryPreview.find((item: any) => item.id === it)
      ) || []
    )
      .concat(queryPreview.filter((it: any) => !query.fixed?.includes(it.id)))
	}

	const filterItems = (items: any[]) => {
    if (query.method === "exclusive") {
      return items
        .filter((it) => query.isolated?.includes(it.id))
        .slice(0, query.limit === 0 ? 10000 : query.limit);
    } else {
      return items
        .filter((it) => !query.isolated?.includes(it.id))
        .slice(0, query.limit === 0 ? 10000 : query.limit);
    }
  };

	const moveItem = (index: number, direction: number) => {
		if (index + direction < 0 || (index + direction) >= (query.fixed ? query.fixed.length : -1)) return;
		const newFixed = [...query?.fixed || []];
		const temp = newFixed[index];
		newFixed[index] = newFixed[index + direction];
		newFixed[index + direction] = temp;
		setQuery({ ...query, fixed: newFixed });
	}

	const sortedItems = sortItems();
	const slot = props.useSlot || 'content-input-slot';

  return (
    <div className="content-input" {...props}>
      {useEditorToolbar && (
        <BlockControls controls={{}}>
          <Slot name={slot} />
        </BlockControls>
      )}

      <Fill name={slot}>
        <ToolbarButton onClick={() => setShowEditor(true)} icon={blockMeta} />
      </Fill>

      {showEditor && (
        <Modal
          onRequestClose={() => setShowEditor(false)}
          title="Content Select"
          className="content-input-modal"
        >
          <Panel>
            <PanelBody>
              {fixedValue?.postType === undefined && (
                <PanelRow>
                  <SelectControl
                    value={query?.postType}
                    onChange={(value) =>
                      setQuery({ ...query, postType: value })
                    }
                    options={postTypes.map((postType: any) => ({
                      label: postType.name,
                      value: postType.slug,
                    }))}
                    label="Post Type"
                  />
                </PanelRow>
              )}
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
              <PanelRow>
                <SelectControl
                  value={query?.method}
                  // @ts-ignore
                  onChange={(value) => setQuery({ ...query, method: value })}
                  options={[
                    { label: "Exclusive", value: "exclusive" },
                    { label: "Inclusive", value: "inclusive" },
                  ]}
                  help="Exclusive will only show posts that have been flagged to be included. Inclusive will show all posts that haven't explicitly been excluded."
                  label="Query Mode"
                />
              </PanelRow>
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
              <PanelRow>{queryPreview.length} results.</PanelRow>
              <PanelRow>
                <table style={{ width: "100%" }}>
                  <tr>
                    <th>Title</th>
                    <th>Actions</th>
                  </tr>
                  {sortedItems.map((it: any, index: number) => (
                    <tr
                      key={it.id}
                      className={
                        (query.limit || 100) < index + 1 ? "excluded" : ""
                      }
                    >
                      <td>{it.title.rendered}</td>
                      <td>
                        <Button
                          onClick={() => toggleIsolation(it.id)}
                          icon={excludeState(it.id)[1]}
                          label={`Click to ${excludeState(it.id)[0]}`}
                        />
                        {lockedState(it.id)[2] && [
                          <Button
                            icon={chevronUp}
                            label="Move Up"
                            onClick={() => moveItem(index || 0, -1)}
                          />,
                          <Button
                            icon={chevronDown}
                            label="Move Down"
                            onClick={() => moveItem(index || 0, 1)}
                          />,
                        ]}
                        <Button
                          icon={pin}
                          style={{ opacity: lockedState(it.id)[1] }}
                          label={lockedState(it.id)[0]}
                          onClick={() => toggleFixed(it.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </table>
              </PanelRow>
            </PanelBody>
          </Panel>
        </Modal>
      )}
      <ContentInputContext.Provider
        value={{
          query,
          results: filterItems(sortedItems),
        }}
      >
        {children}
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
