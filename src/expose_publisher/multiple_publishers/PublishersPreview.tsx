import React from "react"
import {IAuthProvider} from "../../cms_backbone/CMSNavbarRouting";
import axios, {AxiosResponse} from "axios";
import {RouteComponentProps, withRouter} from "react-router-dom";
import PublisherCard from "./PublisherCard";
import {IMiniRecord} from "../../digest/Digest";
import handleFollow, {IPublisherFollow} from "../../utils/HandleFollow";

interface IProps extends RouteComponentProps<any> {
    authProvider: IAuthProvider,
    previewContext: PublisherPreviewContext
}

interface IState {
    publisherJsons: Array<IPublisher>,
    publisherAvas: { [publisher: string]: string },
    publisherBanners: { [publisher: string]: string },
    previewRecordCores: { [publisher: string]: Array<IMiniRecord> }
    currPage?: number,
    totalPageNum?: number
}

interface IPublisher {
    publisher: string,
    followers: number,
    uploads: number,
    isFollowed: boolean,
    lastRecords: Array<number>
}

enum PublisherPreviewContext {
    SEARCH,
    RECOMMENDATION,
    FOLLOWERS,
    SUBSCRIBERS
}

const previewContextCaptions: Map<PublisherPreviewContext, string> = new Map([
    [PublisherPreviewContext.SEARCH, "Found publishers"],
    [PublisherPreviewContext.RECOMMENDATION, "Recommended publishers"],
    [PublisherPreviewContext.FOLLOWERS, "Followers"],
    [PublisherPreviewContext.SUBSCRIBERS, "Subscriptions"]
]);

class PublishersPreview extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        let compState: IState = {
            publisherJsons: [],
            publisherAvas: {},
            publisherBanners: {},
            previewRecordCores: {},
        };

        const previewContext: PublisherPreviewContext = this.props.previewContext;
        if (previewContext === PublisherPreviewContext.SEARCH
            || previewContext === PublisherPreviewContext.FOLLOWERS
            || previewContext === PublisherPreviewContext.SUBSCRIBERS) {
            compState.currPage = 0;
        }

        this.state = compState;
        this.getUrl = this.getUrl.bind(this);
        this.handleFollow = this.handleFollow.bind(this);
        this.loadCurrentPage = this.loadCurrentPage.bind(this);
    }

    getUrl(): string {
        if (this.props.previewContext === PublisherPreviewContext.SEARCH) {
            const publisherPrefix = new URLSearchParams(this.props.location.search).get("query");
            return `http://localhost:8080/search/publishers?name=${publisherPrefix}`;
        }
        if (this.props.previewContext === PublisherPreviewContext.RECOMMENDATION)
            return "http://localhost:8080/recommendations/subscriptions";
        if (this.props.previewContext === PublisherPreviewContext.FOLLOWERS)
            return `http://localhost:8080/users/${this.props.match.params.publisher}/followers`;
        if (this.props.previewContext === PublisherPreviewContext.SUBSCRIBERS)
            return `http://localhost:8080/users/${this.props.match.params.username}/subscriptions`;
        throw new Error("Unknown PublisherPreviewContext");
    }

    handleFollow(publisher: string) {
        const p = this.state.publisherJsons.find((p: IPublisher) => p.publisher === publisher);
        if (p === undefined) {
            console.log("publisher in follow target is undefined")
            return;
        }

        const pFlwData: IPublisherFollow = {
            publisherName: p.publisher,
            isFollowed: p.isFollowed,
            followers: p.followers
        }

        const updFlwState = (updPublFlw: IPublisherFollow) => {
            this.setState((oldState: IState) => {
                const publisherIndex: number = oldState.publisherJsons.findIndex(publ => publ.publisher === updPublFlw.publisherName);
                if (publisherIndex === -1) return oldState;
                let updPublishers = [...oldState.publisherJsons];
                let updTarget = {...updPublishers[publisherIndex]};
                updTarget.isFollowed = updPublFlw.isFollowed;
                updTarget.followers = updPublFlw.followers;
                updPublishers[publisherIndex] = updTarget;
                return {
                    ...oldState,
                    publisherJsons: updPublishers
                }
            });
        }

        handleFollow(pFlwData, this.props.authProvider.getAuth(), updFlwState);
    }

    componentDidMount() {
        this.loadCurrentPage();
    }

    loadCurrentPage() {
        axios.get(this.getUrl(), {
            headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`},
            params: {page: this.state.currPage}
        }).then(success => {
            let updState: { publisherJsons: Array<IPublisher>, totalPageNum?: number };
            const previewContext = this.props.previewContext;
            if (previewContext === PublisherPreviewContext.SEARCH
                || previewContext === PublisherPreviewContext.FOLLOWERS
                || previewContext === PublisherPreviewContext.SUBSCRIBERS) {
                updState = {publisherJsons: success.data.pageItems, totalPageNum: success.data.totalPagesNum};
            } else if (previewContext === PublisherPreviewContext.RECOMMENDATION) {
                updState = {publisherJsons: success.data};
            } else {
                console.log(`Provided state: ${this.props.previewContext}`);
                throw new Error("Unexpected state error.");
            }

            this.setState(updState);
            updState.publisherJsons.forEach((pd: IPublisher) => {
                axios.get(`http://localhost:8080/users/${pd.publisher}/avatar`, {
                    responseType: 'arraybuffer',
                    headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`}
                }).then(success => {
                    if (success.data.byteLength) {
                        this.setState((oldState) => {
                            return {
                                ...oldState,
                                publisherAvas: {
                                    ...oldState.publisherAvas,
                                    [pd.publisher]: Buffer.from(success.data, 'binary').toString('base64')
                                }
                            }
                        })
                    }
                }, error => console.log(error));

                axios.get(`http://localhost:8080/users/${pd.publisher}/top-banner`, {
                    responseType: 'arraybuffer',
                    headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`}
                }).then(success => {
                    if (success.data.byteLength) {
                        this.setState((oldState) => {
                            return {
                                ...oldState,
                                publisherBanners: {
                                    ...oldState.publisherBanners,
                                    [pd.publisher]: Buffer.from(success.data, 'binary').toString('base64')
                                }
                            }
                        });
                    }
                }, error => console.log(error))

                if (pd.lastRecords)
                    axios.get(`http://localhost:8080/users/${pd.publisher}/records/short`, {
                        params: {
                            rids: pd.lastRecords.join(",")
                        },
                        headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`}
                    }).then((success: AxiosResponse<Array<IMiniRecord>>) => {
                        this.setState((oldState) => {
                            return {
                                ...oldState,
                                previewRecordCores: {
                                    ...oldState.previewRecordCores,
                                    [pd.publisher]: success.data
                                }
                            }
                        })
                    }, error => console.log(error));
            })
        }, error => console.log(error));
    }

    componentDidUpdate(prevProps: Readonly<IProps>) {
        if (prevProps.location.search !== this.props.location.search) {
            let freshState: IState = {
                publisherJsons: [],
                publisherAvas: {},
                publisherBanners: {},
                previewRecordCores: {},
                currPage: undefined,
                totalPageNum: undefined
            }

            if (this.props.previewContext === PublisherPreviewContext.SEARCH) {
                freshState.currPage = 0;
            }

            this.setState(freshState, this.componentDidMount);
        }
    }

    render() {
        const publisherCards = this.state.publisherJsons.map((pd: IPublisher) =>
            <PublisherCard key={pd.publisher}
                           authProvider={this.props.authProvider}
                           publisher={pd.publisher}
                           publisherAva={this.state.publisherAvas[pd.publisher]}
                           publisherBanner={this.state.publisherBanners[pd.publisher]}
                           followers={pd.followers}
                           uploads={pd.uploads}
                           isFollowed={pd.isFollowed}
                           lastRecords={this.state.previewRecordCores[pd.publisher]}
                           followCallback={this.handleFollow}/>
        );
        return (
            <div className={"d-flex flex-column"}>
                <h3 className={"ml-3 my-2"}>{previewContextCaptions.get(this.props.previewContext)}</h3>
                <div className={"d-flex flex-wrap justify-content-start"}>
                    {publisherCards}
                </div>
            </div>
        );
    }
}

export {PublisherPreviewContext};
export default withRouter(PublishersPreview);
