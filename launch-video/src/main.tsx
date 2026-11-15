import "./lib/hic-shim"
import "@fontsource-variable/fraunces/full.css"
import "@fontsource-variable/fraunces/full-italic.css"
import "@fontsource-variable/figtree"
import "./styles.css"
import { createRoot } from "react-dom/client"
import { App } from "./App"

createRoot(document.getElementById("root")!).render(<App />)
