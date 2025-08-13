import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";
import { LanguageProvider } from "@/providers/language";

it("renders brand and language toggles", () => {
  render(
    <LanguageProvider>
      <Navbar />
    </LanguageProvider>
  );
  expect(screen.getByText(/SewaGo/i)).toBeInTheDocument();
  expect(screen.getByText("EN")).toBeInTheDocument();
  expect(screen.getByText("ने")).toBeInTheDocument();
});


