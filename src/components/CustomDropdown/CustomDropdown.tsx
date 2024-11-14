import { SupportedCurrenciesV2 } from "@/ergofunctions/Currencies";
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
      unstyled={variant === "unstyled"}
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          borderRadius: 8,
          fontSize: size === "md" && !isMobile ? 18 : 14,
          cursor: "pointer",
          paddingTop: size === "md" ? 3 : 0,
          paddingBottom: size === "md" ? 3 : 0,
          paddingLeft: isMobile ? 4 : 10,
          paddingRight: isMobile ? 4 : 10,
          borderWidth: variant === "outlined" ? 1 : 0,
          borderColor: siteTheme === "dark" ? "#374151" : "inherit",
          background: siteTheme === "dark" ? "#1F2937" : "transparent",
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          color: siteTheme === "dark" ? "#F3F4F6" : "#111827",
        }),
        menuList: (baseStyles) => ({
          ...baseStyles,
          padding: 0,
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          marginTop: 0,
          background: siteTheme === "dark" ? "#1F2937" : "white",
          boxShadow: `0px 0px 10px rgba(0,0,0,${
            siteTheme === "dark" ? "0.5" : "0.1"
          })`,
          color: siteTheme === "dark" ? "#F3F4F6" : "#111827",
          borderRadius: 8,
          overflow: "hidden",
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          fontSize: size === "md" ? 14 : 12,
          background: state.isFocused 
            ? siteTheme === "dark" ? "#374151" : "rgba(0,0,0,0.1)"
            : "transparent",
          ":active": {
            backgroundColor: siteTheme === "dark" ? "#4B5563" : "rgba(0,0,0,0.2)",
          },
          padding: 10,
          color: siteTheme === "dark" ? "#F3F4F6" : "#111827",
          cursor: "pointer",
        }),
        dropdownIndicator: (baseStyles) => ({
          ...baseStyles,
          color: siteTheme === "dark" ? "#9CA3AF" : "#6B7280",
          ":hover": {
            color: siteTheme === "dark" ? "#F3F4F6" : "#111827",
          }
        }),
      }}
    />
  );
};

export default CustomDropdown;
