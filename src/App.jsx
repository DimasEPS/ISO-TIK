import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/auth/context/AuthContext";
import router from "../src/routes/index.jsx";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton duration={5000} />
    </AuthProvider>
  );
}

export default App;
