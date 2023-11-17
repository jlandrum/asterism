import { useState, useEffect, useCallback, useMemo } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import {
  PanelBody,
  PanelRow,
  SelectControl,
  Button,
  Flex,
	Notice,
  __experimentalNumberControl as NumberControl,
  __experimentalGrid as Grid,
} from "@wordpress/components";
import { addQueryArgs } from "@wordpress/url";
import { close, plus } from "@wordpress/icons";

const COMPARATOR_OPTIONS = [
  { label: "Equal To (=)", value: "=" },
  { label: "Not Equal To (≠)", value: "!=" },
];

interface FilterData {
	type: 'taxonomy';
	key: string;
	comparator: string;
	value: string;
	keyLabel?: string;
	valueLabel?: string;
}

interface FiltersProps {
	postTypes: string[];
	filters: FilterData[];
	onChange: (filterData: FilterData[]) => void;
}

export default function Filters({
	postTypes,
	filters,
	onChange
}: FiltersProps) {
	const [postType, _setPostType] = useState("");
	const [taxonomy, _setTaxonomy] = useState("");
  const [comparator, setComparator] = useState("=");
  const [term, setTerm] = useState("");
	const [terms, setTerms] = useState<any[]>([]);
	const [taxonomies, setTaxonomies] = useState<any>({});

	const setPostType = useCallback((postType: string) => {
		_setPostType(postType);
		setTerm("");
		setTaxonomy("");
	}, [taxonomy, term]);

	const setTaxonomy = useCallback((taxonomy: string) => {
		_setTaxonomy(taxonomy);
		setTerm("");
	}, [taxonomy, term]);

	useEffect(() => {
      apiFetch({ path: "/wp/v2/taxonomies" }).then(setTaxonomies as any);
	}, [postTypes]);

	useEffect(() => {
    if (!taxonomy) return;
    apiFetch({
      path: addQueryArgs(`/wp/v2/${taxonomy}`, {
        _fields: ["name", "id", "slug"],
      }),
    }).then((data: any) => {
      setTerms(data);
    });
  }, [taxonomy, taxonomies]);

	const availableTaxonomies = useMemo(() => {
    return Object.keys(taxonomies)
      .filter((it: any) => taxonomies[it].types?.includes?.(postType))
      .map((taxonomy: any) => taxonomies[taxonomy]);
  }, [taxonomies, postTypes, postType]);

  const availableTaxonomyOptions = useMemo(() => {
    return [
      { label: "Select a Taxonomy", value: "", hidden: true },
      ...availableTaxonomies.map((it: any) => ({
        label: it.name,
        value: it.slug,
      })),
    ];
  }, [availableTaxonomies]);

  const termsOptions = useMemo(() => {
    return [
      { label: "Select a Term", value: "", hidden: true },
      ...terms.map((it: any) => ({ label: it.name, value: it.id })),
    ];
  }, [terms]);

	const postTypeOptions = useMemo(() => {
		return [
			{ label: "Select a Post Type", value: "", hidden: true },
			...postTypes.map((it) => ({ label: it, value: it })),
		];
	}, [postTypes]);

	const addFilter = useCallback(() => {
		const newFilters = [
      ...filters,
      {
				postType,
        type: "taxonomy",
        key: taxonomy,
        by: comparator,
        value: term,
        keyLabel: taxonomies[taxonomy]?.name,
        valueLabel: terms.find((it: any) => parseInt(it.id) === parseInt(term))?.name || term,
      },
    ] as FilterData[];
    onChange(newFilters);		
	}, [onChange, filters, terms, term, taxonomy, comparator]);

	const removeFilter = useCallback((index: number) => {
		const newFilters = [...filters];
		newFilters.splice(index, 1);
		onChange(newFilters);
	}, [onChange, filters]);

	return (
    <PanelBody title="Filters" initialOpen={true}>
      <PanelRow>
        <Flex align="flex-end" justify="flex-start">
          <SelectControl
            options={postTypeOptions}
            label="Post Type"
            value={postType}
            onChange={setPostType}
          />
          <SelectControl
            options={availableTaxonomyOptions}
            label="Taxonomy"
            value={taxonomy}
            disabled={availableTaxonomies.length === 0}
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
            disabled={!taxonomy || terms.length === 0}
            onChange={setTerm}
          />
          <Button
            disabled={!taxonomy || !term || !postType}
            icon={plus}
            size="default"
            label="Add Taxonomy Filter"
            variant="primary"
            onClick={addFilter}
          >
            Add Taxonomy Filter
          </Button>
        </Flex>
      </PanelRow>
      {postType && availableTaxonomies.length === 0 && (
				<PanelRow>
					<Notice status="warning" isDismissible={false}>
						There are no taxonomies available for the selected post type.
					</Notice>
				</PanelRow>
      )}
      {filters.length !== 0 && (
        <PanelRow>
          <table className="taxonomy-filters" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Post Type</th>
                {/* <th>Filter Type</th> */}
                <th>Key</th>
                <th>Comparator</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filters?.map((it: any, i) => (
                <tr>
                  <td>{it.postType}</td>
                  {/* <td>{it.type}</td> */}
                  <td>{it.keyLabel}</td>
                  <td>{it.by}</td>
                  <td>{it.valueLabel}</td>
                  <td>
                    <Button
                      size="small"
                      icon={close}
                      onClick={() => removeFilter(i)}
                      label="Remove"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelRow>
      )}
    </PanelBody>
  );
}
