import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Link, useLocation } from "react-router";

const tabPath = (pathname: string) => (pathname.startsWith("/urls") ? "/urls" : "/");

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentTab = tabPath(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <AppBar
        position="sticky"
        elevation={0}
        className="rounded-none border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.85)] backdrop-blur-xl"
      >
        <Toolbar
          className="!gap-4"
          sx={{ "&.MuiToolbar-root": { minHeight: 0 } }}
        >
          <Link
            to="/"
            className="flex-grow text-xl font-bold tracking-tight text-primary no-underline"
          >
            URL Shortener
          </Link>
          <Tabs
            value={currentTab}
            textColor="inherit"
            indicatorColor="primary"
            className="!min-h-0 [&_.MuiTab-root]:!min-h-0"
            sx={{
              minHeight: "0 !important",
              "& .MuiTab-root": { minHeight: "0 !important" },
              "& .MuiTabs-flexContainer": { minHeight: "0 !important" },
            }}
          >
            <Tab label="Shorten" value="/" component={Link} to="/" />
            <Tab label="All URLs" value="/urls" component={Link} to="/urls" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <main className="flex-1 p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}
