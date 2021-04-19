import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Digest from "../digest/Digest";
import store from "store2"
import {BrowserRouter, Redirect, Route, RouteComponentProps, Switch, withRouter} from "react-router-dom";
import PostRecord from "./PostRecord";
import RecordsPreviewPage, {RecordPreviewContext} from "../expose_record/multiple_records/RecordsPreviewPage";
import PublishersPreview, {PublisherPreviewContext} from "../expose_publisher/multiple_publishers/PublishersPreview";
import FullRecordView from "../expose_record/single_record/FullRecordView";
import PublisherMainPage from "../expose_publisher/full_publisher_page/PublisherMainPage";
import EditUserProfile from "../expose_publisher/user_profile_details/EditUserProfile";
import ChangePassword from "../expose_publisher/user_profile_details/ChangePassword";
import EditRecord from "../expose_record/single_record/EditRecord";
import "./local-styles.css"
import 'bootstrap/dist/css/bootstrap.css';
import MainPage from "./MainPage";
import axios from "axios";

interface IAuth {
    username: string,
    token: string,
    permissions?: Array<any> // feature-idea: user roles enum
}

interface IAuthProvider {
    getAuth: () => IAuth
}

interface IState {
    query: string,
    auth: IAuth
}

class CMSNavbarRouting extends React.Component<RouteComponentProps<any>, IState> {
    constructor(props: RouteComponentProps<any>) {
        super(props);
        this.state = {
            query: "",
            auth: {
                username: store.session.get("username"),
                token: store.session.get("token")
            }
        }
        this.getAuth = this.getAuth.bind(this);
    }

    getAuth(): IAuth {
        console.log(this.state.auth)
        return this.state.auth;
    }

    componentDidMount() {
        setInterval(() => {
            console.log("request refresh")
            axios.get("http://localhost:8080/refresh-token", {
                headers: {'Authorization': `Bearer ${store.session.get('token')}`}
            }).then(success => {
                    store.session.set('token', success.data);
                    this.setState(oldState => ({auth: {username: oldState.auth.username, token: success.data}}))
                },
                error => {
                    console.log(error);
                    store.session.clearAll();
                })
        }, store.session.get('expiration') / 2);
    }

    render() {
        if (!store.session.get("isAuthorized")) {
            return <Redirect to={"/login"}/>
        }

        const authProviderProps: IAuthProvider = {getAuth: this.getAuth};

        return (
            <BrowserRouter>
                <div id={"content"}>
                    <Header username={this.state.auth.username}/>
                    <main>
                        <Switch>
                            <Route exact path={"/"}>
                                <MainPage/>
                            </Route>
                            <Route exact path={"/digest"}>
                                <Digest {...authProviderProps} />
                            </Route>
                            <Route exact path={"/publishers"}>
                                <PublishersPreview key={"publisher"} {...{
                                    authProvider: authProviderProps,
                                    previewContext: PublisherPreviewContext.RECOMMENDATION
                                }} />
                            </Route>
                            <Route exact path={"/records"}>
                                <RecordsPreviewPage key={"records"} {...{
                                    authProvider: authProviderProps,
                                    previewContext: RecordPreviewContext.RECOMMENDATION
                                }}/>
                            </Route>
                            <Route exact path={"/post-record"}>
                                <PostRecord {...authProviderProps}/>
                            </Route>
                            <Route exact path={"/profile/:targetUsername"}>
                                <PublisherMainPage authProvider={authProviderProps}/>
                            </Route>
                            <Route exact path={"/search/record"}>
                                <RecordsPreviewPage key={"search-records" + this.state.query}
                                                    {...{
                                                        authProvider: authProviderProps,
                                                        previewContext: RecordPreviewContext.SEARCH
                                                    }}
                                />
                            </Route>
                            <Route exact path={"/search/publisher"}>
                                <PublishersPreview key={"search-publisher" + this.state.query} {...{
                                    authProvider: authProviderProps,
                                    previewContext: PublisherPreviewContext.SEARCH
                                }}/>
                            </Route>
                            <Route exact path={"/users/:publisher/records/:recordId"}>
                                <FullRecordView key={window.location.pathname} {...{authProvider: authProviderProps}}/>
                            </Route>
                            <Route exact path={"/edit-user-details"}>
                                <EditUserProfile {...authProviderProps}/>
                            </Route>
                            <Route exact path={"/change-password"}>
                                <ChangePassword  {...authProviderProps}/>
                            </Route>
                            <Route exact path={"/users/:publisher/records/:recordId/edit"}>
                                <EditRecord {...{authProvider: authProviderProps}}/>
                            </Route>
                            <Route exact path={"/users/:publisher/followers"}>
                                <PublishersPreview key={"followers" + window.location.pathname} {...{
                                    authProvider: authProviderProps,
                                    previewContext: PublisherPreviewContext.FOLLOWERS
                                }}/>
                            </Route>
                            <Route exact path={"/users/:username/subscriptions"}>
                                <PublishersPreview key={"subscriptions" + window.location.pathname} {...{
                                    authProvider: authProviderProps,
                                    previewContext: PublisherPreviewContext.SUBSCRIBERS
                                }}/>
                            </Route>
                        </Switch>
                    </main>
                    <Footer/>
                </div>
            </BrowserRouter>
        )
    }
}


const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export type {IAuth};
export type {IAuthProvider};
export {monthNames};
export default withRouter(CMSNavbarRouting);