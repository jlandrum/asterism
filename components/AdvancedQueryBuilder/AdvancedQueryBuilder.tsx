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
  __experimentalGrid as Grid,
} from "@wordpress/components";
import { select } from "@wordpress/data";
import { update, close } from "@wordpress/icons";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";

declare const acf: any;

interface AdvancedQuery {
  /** The list of post types to query against */
  postType: string;
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
  postType: "page",
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
      postType: "page",
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
    apiFetch({
      path: addQueryArgs(`/wp/v2/${query.postType}`, { per_page: -1 }),
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
          <PanelRow>{queryPreview.length} results.</PanelRow>
          <PanelRow>
            <table>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th></th>
              </tr>
              {queryPreview.map((it: any) => (
                <tr>
                  <td>{it.id}</td>
                  <td>{it.title.rendered}</td>
                  <td>
                    <Button
                      href={`/wp-admin/post.php?post=${it.id}&action=edit`}
                      icon={update}
                    />
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
