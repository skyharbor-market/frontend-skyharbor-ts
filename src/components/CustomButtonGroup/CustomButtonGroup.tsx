interface ButtonGProps {
  label: string;
  onClick: any;
  icon?: JSX.Element;
}

interface CustomButtonGroupProps {
  buttons: ButtonGProps[];
}

export default function CustomButtonGroup({ buttons }: CustomButtonGroupProps) {
  return (
    <span className="isolate inline-flex rounded-md shadow-sm">
      {buttons.map((b: ButtonGProps, index: number) => {
        return (
          <button
            key={b.label}
            type="button"
            className={`relative inline-flex items-center ${
              index === 0 ? "rounded-l-md" : "-ml-px"
            } ${
              index === buttons.length - 1 && "rounded-r-md"
            } bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-10`}
            onClick={b.onClick}
          >
            {b.icon}
            {b.label}
          </button>
        );
      })}
    </span>
  );
}
