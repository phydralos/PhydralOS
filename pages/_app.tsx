import { type AppProps } from "next/app";
import { memo } from "react";
import "styles/tailwind.css";
import { ErrorBoundary } from "components/pages/ErrorBoundary";
import Metadata from "components/pages/Metadata";
import StyledApp from "components/pages/StyledApp";
import { AuthProvider } from "contexts/auth";
import { FileSystemProvider } from "contexts/fileSystem";
import { MenuProvider } from "contexts/menu";
import { ProcessProvider } from "contexts/process";
import { SessionProvider } from "contexts/session";
import { ViewportProvider } from "contexts/viewport";

const App = ({ Component: Index, pageProps }: AppProps): React.ReactElement => (
  <AuthProvider>
    <ViewportProvider>
      <ProcessProvider>
        <FileSystemProvider>
          <SessionProvider>
            <ErrorBoundary>
              <Metadata />
              <StyledApp>
                <MenuProvider>
                  <Index {...pageProps} />
                </MenuProvider>
              </StyledApp>
            </ErrorBoundary>
          </SessionProvider>
        </FileSystemProvider>
      </ProcessProvider>
    </ViewportProvider>
  </AuthProvider>
);

export default memo(App);
