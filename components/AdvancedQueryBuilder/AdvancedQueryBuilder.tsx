import React, {
  createContext,
  useState,
  useCallback,
  useRef,
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
	ButtonGroup,
  __experimentalGrid as Grid,
} from "@wordpress/components";
import { select } from "@wordpress/data";
import { update, close, pencil, unseen, seen, lock, unlock } from "@wordpress/icons";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";

declare const acf: any;

interface AdvancedQuery {
	/** The post type to query */
  postType: string;
	/** The querying method */
	method?: 'exclusive' | 'inclusive';
	/** The ordering method */
	order?: 'newest' | 'oldest' | 'az' | 'za';
}

interface AdvancedQueryBuilderProps {
  /** The current query */
  value?: AdvancedQuery;
  /** If provided, the query builder will create a button and place
   *  it into the given slot. Clicking the button will open the query
   *  builder. Otherwise, the query builder will be rendered inline.
   */
  slot?: string;
  /** The children to render, which will also provide a context in which
   *  the result of the query can be accessed.
   */
  children: any;
  /** Called when the query has updated. */
  onValueChange?: (value: AdvancedQuery) => void;
  [props: string]: any;
}

const AdvancedQueryBuilderContext = createContext<AdvancedQuery>({
  postType: "pages",
});

const _AdvancedQueryBuilder = ({
  value,
  children,
  onValueChange,
  ...props
}: AdvancedQueryBuilderProps) => {
  const [queryPreview, setQueryPreview] = useState<any>([]);

  const query = useMemo(
    () => ({
      postType: "pages",
      ...value,
    }),
    [value]
  );

  const postTypes = select("core").getPostTypes({ per_page: -1 }) || [];

  const setQuery = (newQuery: AdvancedQuery) => {
    onValueChange?.(newQuery);
  };

  //Run the query and get the results
  useEffect(() => {
		const restEndpoint = postTypes.find((it: any) => it.slug === query.postType)?.rest_base;
    apiFetch({
      path: addQueryArgs(`/wp/v2/${restEndpoint}`, {
        per_page: -1,
        order:
          query.order === "az" || query.order === "newest" ? "asc" : "desc",
				orderby: query.order === "az" || query.order === "za" ? "title" : "date",
      }),
      method: "GET",
    })
      .then((data) => {
        setQueryPreview(data);
      })
      .catch(() => {
        setQueryPreview([]);
      });
  }, [query]);

  return (
    <div className="advanced-query-builder" {...props}>
      <Panel header="Advanced Query Builder">
        {/* <pre>{JSON.stringify(postTypes, null, 2)}</pre> */}
        <PanelBody>
          <PanelRow>
            <SelectControl
              value={query?.postType}
              onChange={(value) => setQuery({ ...query, postType: value })}
              options={postTypes.map((postType: any) => ({
                label: postType.name,
                value: postType.slug,
              }))}
              label="Post Type"
            />{" "}
          </PanelRow>
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
              ]}
              help="Exclusive will only show posts that have been flagged to be included. Inclusive will show all posts that haven't explicitly been excluded."
              label="Query Mode"
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
          <PanelRow>{queryPreview.length} results.</PanelRow>
          <PanelRow>
            <table style={{ width: "100%" }}>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
              {queryPreview.map((it: any) => (
                <tr>
                  <td>{it.id}</td>
                  <td>{it.title.rendered}</td>
                  <td>
                    <ButtonGroup style={{float: 'right'}}>
                      <Button
                        variant="tertiary"
                        href={`/wp-admin/post.php?post=${it.id}&action=edit`}
                        target="_blank"
                        icon={pencil}
                        label={`Edit ${it.title.rendered}`}
                      />
                      <Button
                        variant="tertiary"
                        icon={unseen}
                        label={`${
                          query.method === "exclusive" ? "Exclude" : "Include"
                        }`}
                      />
                      <Button
                        variant="tertiary"
                        icon={lock}
                        label={"Pin to Top"}
                      />
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </table>
          </PanelRow>
        </PanelBody>
      </Panel>
      <AdvancedQueryBuilderContext.Provider value={query}>
        {children}
      </AdvancedQueryBuilderContext.Provider>
    </div>
  );
};

export const AdvancedQueryBuilder = (props: AdvancedQueryBuilderProps) => {
  return (
    <EditOnly>
      <_AdvancedQueryBuilder {...props} />
    </EditOnly>
  );
};

export default AdvancedQueryBuilder;
