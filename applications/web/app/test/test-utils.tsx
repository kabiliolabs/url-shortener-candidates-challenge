import { render, type RenderOptions } from "@testing-library/react";

/**
 * Custom render function with default exports from RTL
 */
export function renderComponent(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, options);
}

export * from "@testing-library/react";
