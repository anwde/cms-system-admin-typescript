import React,{Suspense} from "react";
import { BrowserRouter, Router, Switch} from "react-router-dom";
import { Provider } from "react-redux";
import IndexRoutes from "./routes/index";
import { PrivateRoute } from "./routes/private_routes";
import { createBrowserHistory } from "history";
import webapi from "./utils/webapi";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import Loading from "./components/loading/loading";
const History = createBrowserHistory({ basename: "/" });
type State = {
  is_auth: boolean;
  server: Server.Server;
};
class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      is_auth: this.get_is_auth(),
      server: {
        ucdata: {},
        columns: [],
        menus: [],
        loading: false,
        code: 0,
        version: "",
      },
    };
    this.server();
  }
  componentWillMount() {
    webapi.store.subscribe(() => {
      const d = webapi.store.getState();
      this.setState({
        server: d.server,
      });
      // console.log("props=>", d);
    });
  }
  /*--------------------------------------------------------------------------------
    *  get_is_auth 
  --------------------------------------------------------------------------------*/

  get_is_auth() {
    return window.location.pathname.indexOf("/auth") === -1
      ? false
      : true;
  }
  /*--------------------------------------------------------------------------------
    *  server 
  --------------------------------------------------------------------------------*/
  async server() {
    if (process.env.NODE_ENV === "development") {
      require("./test.js");
    } else {
      webapi.init_store();
    }

    const params = webapi.utils.query();
    // params.test && webapi.cache.set("test", params.test);
    webapi.server();
    webapi.customizer.launch();
  }
  render() {
    const state = this.state;
    // console.log("data=>", Routes, state);
    return (
      <ConfigProvider locale={zhCN}>
        <Provider store={webapi.store}>
          {state.server.loading ? <Loading /> : <></>}
          {state.server.code === 10000 || state.is_auth ? (
            
            <Suspense fallback={<Loading />}>
            <Router history={History}>
              <Switch>
              {IndexRoutes.map((prop, key) => {
                  return ( 
                    <PrivateRoute
                      path={prop.path}
                      key={key}
                      component={prop.component}
                    />
                  );
                })}
              </Switch>
            </Router>
            </Suspense>

          ) : (
            <Loading />
          )}
        </Provider>
      </ConfigProvider>
    );
  }
}
export default App;
