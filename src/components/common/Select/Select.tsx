import cn from "classnames";
import { ReactNode } from "react";
import styles from "./Select.module.css";

type SelectProps = {
  id?: string;
  className?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  children?: ReactNode;
};
export function Select({
  id,
  className,
  value,
  disabled,
  onChange,
  children,
}: SelectProps) {
  return (
    <select
      id={id}
      className={cn(className, styles.select)}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
    >{children}</select>
  );
}
