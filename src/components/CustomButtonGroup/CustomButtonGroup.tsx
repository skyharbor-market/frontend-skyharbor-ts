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
            type="button"
            className={`relative inline-flex items-center ${
              index === 0 ? "rounded-l-md" : "-ml-px"
            } ${
              index === buttons.length - 1 && "rounded-r-md"
            } bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10`}
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
