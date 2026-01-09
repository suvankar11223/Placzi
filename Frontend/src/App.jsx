import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/custom/Header";
import { Toaster } from "./components/ui/sonner";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { addUserData } from "./features/user/userFeatures";
import { startUser } from "./Services/login";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.editUser.userData);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await startUser();
        if (response?.statusCode === 200) {
          dispatch(addUserData(response.data));
        } else {
          dispatch(addUserData(null));
        }
      } catch (error) {
        dispatch(addUserData(null));
      }
    };

    fetchUser();
  }, [dispatch]);

  useEffect(() => {
    if (user === null) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      {location.pathname !== '/ai-chat' && <Header user={user} />}
      <Outlet />
      <Toaster />
    </>
  );
}

export default App;
