import styles from "./Button.module.css";

export const enum Size {
  small,
  medium,
  large,
  custom,
}

interface IButton {
  text?: string;
  pill?: boolean;
  fill?: boolean;
  size?: Size;
  onClick?: () => void;
}

export default function Button(props: IButton) {
  const classList = [styles.button];

  let sizeClass;
  switch (props.size) {
    case Size.small:
      sizeClass = styles.small;
      break;
    case Size.large:
      sizeClass = styles.large;
      break;
    case Size.medium:
    default:
      sizeClass = styles.medium;
      break;
  }
  classList.push(sizeClass);

  if (props.pill) classList.push(styles.pill);

  if (props.fill) classList.push(styles.fill);

  return (
    <button type="button" className={classList.join(" ")} onClick={props.onClick}>
      {props.text}
    </button>
  );
}
