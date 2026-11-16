// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

afterEach(cleanup);

describe("ui primitives", () => {
  it("render with merged class names and native semantics", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input aria-label="url" className="extra" />
          <Button disabled>Go</Button>
          <Alert variant="destructive">
            <AlertTitle>Oops</AlertTitle>
            <AlertDescription>Details</AlertDescription>
          </Alert>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Head</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Cell</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>,
    );

    expect(screen.getByRole("heading", { name: "Title" })).toBeTruthy();
    expect(screen.getByLabelText("url").className).toContain("extra");
    expect((screen.getByRole("button", { name: "Go" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("alert").textContent).toBe("OopsDetails");
    expect(screen.getByRole("cell", { name: "Cell" })).toBeTruthy();
  });

  it("Button asChild renders the child element", () => {
    render(
      <Button asChild>
        <a href="/x">Link</a>
      </Button>,
    );

    expect(screen.getByRole("link", { name: "Link" }).getAttribute("data-slot")).toBe("button");
  });
});
