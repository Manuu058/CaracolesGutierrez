import Navbar from "../components/Navbar";
import AuthGuard from "../components/AuthGuard";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthGuard>
          <Navbar />
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}