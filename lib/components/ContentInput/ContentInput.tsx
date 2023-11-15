// TODO: This REALLY needs to be split into multiple components

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
	TextControl,
	Flex,
	__experimentalNumberControl as NumberControl,
  __experimentalGrid as Grid,
} from "@wordpress/components";
import { BlockControls } from "@wordpress/block-editor";
import { select } from "@wordpress/data";
import { chevronUp, chevronDown, unseen, seen, pin, edit, close, blockMeta, plus } from "@wordpress/icons";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import { useFocusManager } from "../FocusManager/FocusManager";

const COMPARATOR_OPTIONS = [
	{ label: "Equals", value: "=" },
	{ label: "Does Not Equal", value: "!=" },
];

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
	/** Filters to apply to the query */
	filters?: any[];
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
	const [search, setSearch] = useState('');
	const [taxonomies, setTaxonomies] = useState<any>({});
	const [showButton, setShowButton] = useState(false);

	// For the filter editor
	const [taxonomy, setTaxonomy] = useState('');
	const [comparator, setComparator] = useState('=');
	const [term, setTerm] = useState('');
	const [terms, setTerms] = useState<any>([]);

	const focusListener = useFocusManager(
		() => setShowButton(false),
		() => setShowButton(true),
		[], true
	);

  const query = useMemo(
    () => ({
      postType: "pages",
			method: "inclusive" as const,
			order: "newest" as const,
			limit: 0,
			filters: [],
      ...value,
			...fixedValue,
    }),
    [value]
  );

	const postTypes = useMemo(() => select("core").getPostTypes({ per_page: -1 }) || [], []);

	// Ensure the initial value is set
	useEffect(() => {
		if (!value || !value.postType) {
			onValueChange?.(query);
		}
	}, []);

	useEffect(() => {
		apiFetch({ path: '/wp/v2/taxonomies' }).then(setTaxonomies as any) 
	}, [query.postType]);

  const setQuery = (newQuery: ContentQuery) => {
    onValueChange?.(newQuery);
  };

  //Run the query and get the results
  useEffect(() => {
    const restEndpoint = postTypes.find(
      (it: any) => it.slug === query.postType
    )?.rest_base;

		const args = {
      per_page: -1,
      order: query.order === "az" || query.order === "newest" ? "asc" : "desc",
      orderby: query.order === "az" || query.order === "za" ? "title" : "date",
    } as any;

		if (query.filters) {
			query.filters.forEach((filter: any) => {
				args[filter.key] = `${filter.value}`;
			});
		}

    apiFetch({
      path: addQueryArgs(`/wp/v2/${restEndpoint}`, args),
      method: "GET",
    })
      .then((data) => {
        setQueryPreview(
          query.order === "random" ? shuffleArray(data as any[]) : data
        );
      })
      .catch((e) => {
        console.error(e);
        setQueryPreview([]);
      });
  }, [postTypes, query.order, query.postType, query.filters]);

	useEffect(() => {
		if (!taxonomy) return;
		apiFetch({ path: addQueryArgs(`/wp/v2/${taxonomy}`, {
			'_fields': ['name', 'id', 'slug']
		}) }).then((data: any) => {
			setTerms(data);
		});
	}, [taxonomy, taxonomies]);

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

	const sortedItems = sortItems().filter((it) => search ? it.title.rendered.toLowerCase().includes(search.toLowerCase()) : true);
	const slot = props.useSlot || 'content-input-slot';

	const availableTaxonomies = useMemo(() => {
		return Object.keys(taxonomies)
      .filter((it: any) => taxonomies[it].types?.includes?.(query.postType))
      .map((taxonomy: any) => taxonomies[taxonomy]);
	}, [taxonomies, query.postType]);

	const availableTaxonomyOptions = useMemo(() => {
		return [
			{ label: 'Select a Taxonomy', value: '', hidden: true },
			...availableTaxonomies.map((it: any) => ({ label: it.name, value: it.slug })),
		]
	}, [availableTaxonomies]);

	const termsOptions = useMemo(() => {
		return [
			{ label: 'Select a Term', value: '', hidden: true },
			...terms.map((it: any) => ({ label: it.name, value: it.id }))
		];
	}, [terms]);

	const addFilter = () => {
		setQuery({...query, filters: [...query.filters, { type: 'taxonomy', key: taxonomy, by: comparator, value: term } ]})
	};

	const removeTaxonomyFilter = (index: number) => {
		const newFilters = [...query.filters];
		newFilters.splice(index, 1);
		setQuery({...query, filters: newFilters});
	}

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
          onRequestClose={() => setShowEditor(false)}
          title="Content Select"
          className="content-input-modal"
        >
          <Panel>
            <PanelBody>
              {!fixedValue?.postType && (
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
            </PanelBody>
            <PanelBody title="Filters" initialOpen={true}>
              <PanelRow>
                <Flex align="flex-end" justify="flex-start">
                  <SelectControl
                    options={availableTaxonomyOptions}
                    label="Taxonomy"
                    value={taxonomy}
                    onChange={setTaxonomy}
                  />
                  <SelectControl
                    options={COMPARATOR_OPTIONS}
                    label="Comparator"
                    value={comparator}
                    onChange={setComparator}
                  />
                  <SelectControl
                    options={termsOptions}
                    label="Term"
                    value={term}
                    onChange={setTerm}
                  />
                  <Button
                    icon={plus}
                    size="small"
                    label="Add Filter"
                    variant="primary"
                    onClick={addFilter}
                  />
                </Flex>
              </PanelRow>
              <PanelRow>
                <table className="taxonomy-filters" style={{ width: "100%" }}>
                  <tr>
                    <th>Taxonomy</th>
                    <th>Comparator</th>
                    <th>Value</th>
                    <th>Actions</th>
                  </tr>
                  {query.filters?.map((it: any, i) => (
                    <tr>
                      <td>{it.key}</td>
                      <td>{it.by}</td>
                      <td>{it.value}</td>
                      <td>
                        <Button
                          size="small"
                          icon={close}
                          onClick={() => removeTaxonomyFilter(i)}
                          label="Remove"
                        />
                      </td>
                    </tr>
                  ))}
                </table>
              </PanelRow>
            </PanelBody>
            <PanelBody title={`Results (${queryPreview.length})`}>
              <PanelRow>
                <TextControl
                  label="Filter Results"
                  value={search}
                  help="Filters the result table to help find a specific entry; does not affect the query."
                  onChange={(v) => setSearch(v)}
                />
              </PanelRow>
              <PanelRow>
                <table className="results" style={{ width: "100%" }}>
                  <tr>
                    <th>Title</th>
                    <th>Actions</th>
                  </tr>
                  {sortedItems.map((it: any, index: number) => (
                    <tr
                      key={it.id}
                      className={(query.limit || 100) < index + 1 ? "" : ""}
                    >
                      <td
                        dangerouslySetInnerHTML={{ __html: it.title.rendered }}
                      />
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
                        <Button
                          size="small"
                          onClick={() => toggleIsolation(it.id)}
                          icon={excludeState(it.id)[1]}
                          label={`${excludeState(it.id)[0]}`}
                        />
                        <Button
                          size="small"
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
