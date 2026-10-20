import { Header } from "./Header";
import { HueSlider, PaginationKeys } from "./ThemeControls";

type SiteShellProps = {
  children: React.ReactNode;
  showHeader?: boolean;
};

export function SiteShell({ children, showHeader = true }: SiteShellProps) {
  return (
    <>
      {showHeader ? <Header /> : null}
      <HueSlider />
      <main>{children}</main>
      <PaginationKeys />
    </>
  );
}
