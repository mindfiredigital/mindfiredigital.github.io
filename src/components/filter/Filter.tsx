"use client";
import clsx from "clsx";
import {
  createContext,
  ReactNode,
  useContext,
  ChangeEvent,
  useState,
  useEffect,
} from "react";

interface Filter {
  key: string;
  items: string[];
}

const FilterContext = createContext({});

function Filter({
  children,
  className,
  filter,
}: {
  children: ReactNode;
  className: string;
  filter?: (params: string) => void;
}) {
  const [filteration, setFilteration] = useState<any>({});
  useEffect(() => {
    const keys = Object.keys(filteration);
    if (keys.length > 0) {
      const queryParams = keys.reduce((cumm: any, curr: any) => {
        const filters = `${curr}=${filteration[curr].join(",")}`;
        return cumm + (cumm === "" ? filters : `&${filters}`);
      }, "");
      filter?.(queryParams);
    }
  }, [filteration, filter]);
  const setFilterItems = ({ key, value }: { key: string; value: string }) => {
    setFilteration((prevState: any) => ({
      ...prevState,
      [key]: [...(prevState[key] ?? []), value],
    }));
  };
  const removeFromFilterItems = ({
    key,
    value,
  }: {
    key: string;
    value: string;
  }) => {
    setFilteration((prevState: any) => ({
      ...prevState,
      [key]: prevState[key].filter((item: string) => item !== value),
    }));
  };

  return (
    <FilterContext.Provider value={{ setFilterItems, removeFromFilterItems }}>
      <div className={clsx(className)}>{children}</div>
    </FilterContext.Provider>
  );
}

function MultiSelectFilter({
  label,
  items,
}: {
  label: string;
  items: Array<{ label: string; value: string }>;
}) {
  const filterContext = useContext(FilterContext);
  if (!filterContext) {
    throw new Error(
      "Multi select filter cannot be used without Filter component"
    );
  }
  const onCheckboxSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    const value = event.target.value;

    if (isChecked) {
      // @ts-ignore
      filterContext.setFilterItems({ key: label, value });
    } else {
      // @ts-ignore
      filterContext.removeFromFilterItems({ key: label, value });
    }
  };
  return (
    <div>
      <h2>By - {label}</h2>
      <div>
        {items.map(({ label, value }) => {
          return (
            <div key={label} className="flex gap-2">
              <input
                type="checkbox"
                id={label}
                onChange={onCheckboxSelection}
                value={label}
              />
              <label htmlFor={label}>{value}</label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Filter.MultiSelect = MultiSelectFilter;

export default Filter;
