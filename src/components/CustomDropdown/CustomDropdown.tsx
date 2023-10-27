import { SupportedCurrenciesV2 } from "@/ergofunctions/consts";
import React, { useEffect, useState } from "react";
import Select, {
  ActionMeta,
  components,
  MultiValue,
  PropsValue,
  SingleValue,
  ValueContainerProps,
} from "react-select";

const options = [
  { value: "erg", label: "ERG" },
  { value: "sigusd", label: "SigUSD" },
  { value: "sigrsv", label: "SigRSV" },
];

interface OptionsListProps {
  value: string;
  label: string;
}

interface DropdownProps {
  items: OptionsListProps[];
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "outlined" | "unstyled";
  value: string;
  onChange: (
    newValue: MultiValue<OptionsListProps> | SingleValue<OptionsListProps>,
    actionMeta: ActionMeta<OptionsListProps>
  ) => void;
}

const CustomDropdown = ({
  items,
  disabled = false,
  size = "md",
  variant = "outlined",
  value,
  onChange,
}: DropdownProps) => {
  const [siteTheme, setSiteTheme] = useState<"light" | "dark">("light");
  const [currentValue, setCurrentValue] = useState<
    OptionsListProps | undefined
  >(items[0]);

  const ValueContainer = ({ children, ...props }: ValueContainerProps) => {
    const selectedValue = props?.getValue()[0];

    // @ts-ignore
    const imagePath = SupportedCurrenciesV2[selectedValue?.value]?.logo || "";
    return (
      components.ValueContainer && (
        <components.ValueContainer {...props}>
          <div className="flex flex-row items-center">
            {/* {!!children && imagePath && variant !== "unstyled" && !isMobile && (
              <img src={imagePath} width={"20px"} height={"20px"} />
            )} */}
            {children}
          </div>
        </components.ValueContainer>
      )
    );
  };

  useEffect(() => {
    const newVal = items.find((x) => x.value === value);
    setCurrentValue(newVal);
  }, [value, items]);

  useEffect(() => {
    const t: any = localStorage.getItem("theme") || "light";
    setSiteTheme(t);
  }, []);
  const isMobile = true;

  return (
    <Select
      options={items}
      onChange={onChange}
      value={currentValue}
      isDisabled={disabled}
      // @ts-ignore
      components={{ ValueContainer }}
      isSearchable={false}
      // defaultValue={currentVal}
      unstyled={variant === "unstyled"}
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          //   borderColor: state.isFocused ? "grey" : "black",
          borderRadius: 8,
          fontSize: size === "md" && !isMobile ? 18 : 14,
          cursor: "pointer",

          paddingTop: size === "md" ? 3 : 0,
          paddingBottom: size === "md" ? 3 : 0,
          paddingLeft: isMobile ? 4 : 10,
          paddingRight: isMobile ? 4 : 10,
          borderWidth: variant === "outlined" ? 1 : 0,
          borderColor: variant === "outlined" ? "inherit" : "transparent",
          background: "transparent",
        }),
        singleValue: (baseStyles, state) => ({
          ...baseStyles,
          color: siteTheme === "light" ? "black" : "white",
        }),

        menuList: (baseStyles, state) => ({
          ...baseStyles,
          paddingTop: 0,
          paddingBottom: 0,
        }),
        menu: (baseStyles, state) => ({
          ...baseStyles,
          marginTop: 0,
          background: siteTheme === "light" ? "white" : "#11151d",
          boxShadow: `0px 0px 10px rgba(0,0,0,${
            siteTheme === "light" ? "0.1" : "0.3"
          })`,
          color: siteTheme === "light" ? "black" : "white",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          borderBottomRightRadius: 8,
          borderBottomLeftRadius: 8,
          overflow: "hidden",
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          fontSize: size === "md" ? 18 : 14,
          background: state.isFocused ? `rgba(0,0,0,0.1)` : `none`,
          ":active": {
            backgroundColor:
              siteTheme === "light" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.7)",
          },
          padding: 10,
          color: siteTheme === "light" ? "black" : "white",
          cursor: "pointer",
        }),
      }}
    />
  );
};

export default CustomDropdown;
