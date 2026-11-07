import AdminPage from "../../views/AdminPage";

export const metadata = {
  title: "Studio",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AdminPage />;
}
