import "./style.css";
import { App } from "./App";

new App()
  .init(document.getElementById("app")!)
  .catch((error) => console.error(error));
