export async function getServerSideProps() {
  return { redirect: { destination: "/Admin/Dashboard", permanent: false } };
}

export default function AdminIndex() {
  return null;
}
