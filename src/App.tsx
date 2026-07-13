import { Navigate, Route, Routes } from "react-router-dom";

import { OwnerLayout } from "./pages/OwnerLayout";
import { NewPassport } from "./pages/NewPassport";

export default function App() {
  return (
    <Routes>
      <Route path="/owner" element={<OwnerLayout />}>
        <Route index element={<NewPassport />} />
      </Route>
      <Route path="/" element={<Navigate to="/owner" replace />} />
      <Route path="*" element={<Navigate to="/owner" replace />} />
    </Routes>
  );
}
