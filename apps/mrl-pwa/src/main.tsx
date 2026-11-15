import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { mrlRouter } from "./router";
import "@/styles.css";

createRoot(document.getElementById("root")!).render(<StrictMode><RouterProvider router={mrlRouter}/></StrictMode>);
