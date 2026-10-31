import AsciiFigure from "../../Components/AsciiFigure/AsciiFigure";
import { useDocumentTitle } from "../../hooks";
import styles from "./HomePage.module.css";

export default function HomePage() {
  useDocumentTitle("Thomas Huang");

  return (
    <div className={styles.figure}>
      <AsciiFigure size="large" />
    </div>
  );
}
