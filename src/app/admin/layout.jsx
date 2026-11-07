// Every /admin route (studio, login, preview) is noindex.
export const metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }) {
  return children;
}
