import React from "react";
import Login from "./auth/Login";
import {Route, Switch, withRouter} from "react-router-dom";
import Registration from "./auth/Registration";
import CMSMain from "./cms_backbone/CMSNavbarRouting";
import ProtectedPage from "./auth/ProtectedPage";
import ConfirmRegistration from "./auth/ConfirmRegistration";

class App extends React.Component<any, any> {

    render() {
        return (
            <Switch>
                <Route exact path={"/login"} component={Login}/>
                <Route exact path={"/register"} component={Registration}/>
                <Route exact path={"/confirm/:token"} component={ConfirmRegistration}/>
                <ProtectedPage path={"/"}>
                    <CMSMain/>
                </ProtectedPage>
            </Switch>
        );
    }

}

export default withRouter(App);
