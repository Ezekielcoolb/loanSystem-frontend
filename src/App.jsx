
import "./App.css";
import Routess from "./Routes";
import { Toaster } from "react-hot-toast";
// import { AppProvider } from "./Context/Context";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";

function App() {
  return (
    <Provider store={store}>
      <div className="">
        <BrowserRouter>
          <Routess />
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </Provider>
  );
}

export default App;


