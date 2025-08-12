import React from "react";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";
import { LanguageProvider } from "@/providers/language";
import { LiteModeProvider } from "@/providers/lite";

it("renders brand and language toggles", () => {
  render(
    <LiteModeProvider>
      <LanguageProvider>
        <Navbar />
      </LanguageProvider>
    </LiteModeProvider>
  );
  expect(screen.getByText(/SewaGo/i)).toBeInTheDocument();
  expect(screen.getByText("EN")).toBeInTheDocument();
  expect(screen.getByText("ने")).toBeInTheDocument();
});


