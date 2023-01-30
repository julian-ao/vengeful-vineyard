interface ItemProps {
  text: string;
  selected?: boolean;
}

export const Item = ({ text, selected = false }: ItemProps) => (
  <li
    className={`${
      selected ? "text-white border-b-4 border-b-white" : "text-slate-9"
    } font-medium cursor-pointer`}
  >
    {text}
  </li>
);
