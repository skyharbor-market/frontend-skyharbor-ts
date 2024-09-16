import Link from "next/link";
import React from "react";
import Fade from "../Fade/Fade";
import { Loader } from "../Loader";

interface ButtonProps {
  colorScheme?: "primary" | "blue" | "orange" | "red" | "green" | "purple";
  buttonStyle?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "link"
    | "outline"
    | "green";
  internal?: boolean;
  href?: string;
  className?: string;
  variant?: "primary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  animate?: boolean;
  icon?: string;
  children?: JSX.Element | JSX.Element[] | string | string[];
  [key: string]: unknown;
}

const renderIcon = (iconName: string) => {
  if (iconName) {
    console.log('they be lookin for an icon called "' + iconName + '"yo');
    return "<" + { iconName } + "/>";
  } else {
    console.log("no need for an icon on this button dawg");
  }
};

export const Button: React.FC<ButtonProps> = ({
  colorScheme = "primary",
  className = "",
  href,
  internal = true,
  buttonStyle = "secondary",
  variant = "primary",
  animate = false,
  icon = "",
  children,
  disabled,
  loading = false,
  ...rest
}): JSX.Element => {
  // const classes = ['cursor-pointer hover:shadow-lg m-0 py-2 px-6 text-center rounded-3xl inline-block font-bold'];

  // if (disabled) {
  //     classes.push('cursor-not-allowed bg-dark-300 hover:bg-dark-300 active:bg-dark-300 text-dark-350');
  // }

  let buttonColorScheme = "bg-blue-500";
  if (colorScheme === "orange") {
    buttonColorScheme = "bg-orange-600";
  }
  if (colorScheme === "green") {
    buttonColorScheme = "bg-green-600";
  }
  if (colorScheme === "purple") {
    buttonColorScheme = "bg-purple-600";
  }

  if (colorScheme === "red") {
    buttonColorScheme = "bg-red-500 hover:bg-red-600";
  }


  const classes = `transition-all ${
    variant === "primary"
      ? "text-white dark:text-black"
      : "text-black dark:text-white"
  } ${
    variant == "primary" ? buttonColorScheme : "bg-transparent"
  } hover:shadow-lg m-0 py-2 px-6 text-center dark:text-black rounded-lg inline-block font transition-all ${
    disabled ? "opacity-60" : "cursor-pointer"
  } ${className}`;

  if (internal && href?.length) {
    return (
      <Link href={href} className={classes + " " + className} {...rest}>
        {children}
      </Link>
    );
  }

  if (!internal && href?.length) {
    return (
      <a href={href} className={classes + " " + className} {...rest}>
        {children}
      </a>
    );
  }

  if (loading) {
    return (
      <button className={classes + " " + className} disabled={true} {...rest}>
        <div className="h-8 invert">
          <div className="-mt-3.5">
            <Fade fadeKey={"loaderupgrade"} fadeDuration={0.2}>
              <Loader scale={0.5} />
            </Fade>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button className={classes + " " + className} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;
