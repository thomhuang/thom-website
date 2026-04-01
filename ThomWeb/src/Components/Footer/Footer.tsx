import React from "react";
import { useAppSelector } from "../../hooks";

export default function Footer() {
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return <div></div>;
}
