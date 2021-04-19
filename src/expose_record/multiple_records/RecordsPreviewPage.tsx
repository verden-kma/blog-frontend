import React from "react"
import {IAuthProvider} from "../../cms_backbone/CMSNavbarRouting";
import {RouteComponentProps, withRouter} from "react-router-dom";
import axios, {AxiosResponse} from "axios";
import RecordCard from "./RecordCard";
import ReactPaginate from 'react-paginate';
import genericHandleEvaluation from "../../utils/GenericHandleEvaluation";
import {Container, Row} from "react-bootstrap";
import "./pagination-styles.css";

interface IProps extends RouteComponentProps<any> {
    authProvider: IAuthProvider,
    previewContext: RecordPreviewContext,
    targetUsername?: string
}

interface IState {
    recordJsons: Array<IRecord>,
    recordImgs: Map<string, string>,
    currPage?: number,
    numPages?: number,
}

interface IRecord {
    publisher: string,
    id: number,
    caption: string,
    adText: string | null,
    timestamp: string,
    isEdited: boolean,
    reaction: boolean | null,
    likes: number,
    dislikes: number,
    numOfComments: number
}


enum RecordPreviewContext {
    PUBLISHER_RECORDS,
    SEARCH,
    RECOMMENDATION
}

const previewContextCaptions: Map<RecordPreviewContext, string> = new Map([
    [RecordPreviewContext.PUBLISHER_RECORDS, "Publisher records"],
    [RecordPreviewContext.SEARCH, "Found records"],
    [RecordPreviewContext.RECOMMENDATION, "Recommended records"],
]);

interface IEagerRecordsPage {
    pageItems: Array<IRecord>,
    totalPagesNum: number
}

class RecordsPreviewPage extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            recordJsons: [],
            recordImgs: new Map(),
            currPage: 0
        }
        this.getUrl = this.getUrl.bind(this);
        this.loadCurrentPage = this.loadCurrentPage.bind(this);
        this.handleEvaluation = this.handleEvaluation.bind(this);
        this.loadImages = this.loadImages.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    getUrl(): string {
        if (this.props.previewContext === RecordPreviewContext.PUBLISHER_RECORDS) {
            return `http://localhost:8080/users/${this.props.targetUsername}/records`;
        }
        if (this.props.previewContext === RecordPreviewContext.SEARCH) {
            const paramValue = new URLSearchParams(this.props.location.search).get("query");
            // const paramValue = this.props.match.params.query;
            return `http://localhost:8080/search/records?title=${paramValue}`
        }
        if (this.props.previewContext === RecordPreviewContext.RECOMMENDATION) {
            return "http://localhost:8080/recommendations/evaluations"
        }
        throw "Unknown RecordPreviewContext";
    }

    componentDidMount() {
        if (this.props.previewContext === RecordPreviewContext.RECOMMENDATION) {
            axios.get(this.getUrl(), {
                headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`}
            }).then((success: AxiosResponse<Array<IRecord>>) => {
                this.setState({recordJsons: success.data},
                    () => this.loadImages())
            }, error => console.log(error))
        } else this.loadCurrentPage();
    }

    loadCurrentPage() {
        axios.get(this.getUrl(), {
            headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`},
            params: {page: this.state.currPage}
        }).then((success: AxiosResponse<IEagerRecordsPage>) => {
            const {pageItems, totalPagesNum} = success.data;
            this.setState({recordJsons: pageItems, numPages: totalPagesNum},
                () => this.loadImages())
        }, error => console.log(error))
    }

    loadImages() {
        this.state.recordJsons.forEach(({publisher, id}: IRecord) => {
            axios.get(`http://localhost:8080/users/${publisher}/records/${id}/image-min`,
                {
                    responseType: 'arraybuffer',
                    headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`}
                }).then(response => {
                this.setState((oldState: IState) => {
                    let updImgs: Map<string, string> = new Map(oldState.recordImgs);
                    const imgStr = Buffer.from(response.data, 'binary').toString('base64');
                    updImgs.set(JSON.stringify({publisher: publisher, recOwnId: id}), imgStr);
                    return {
                        ...oldState,
                        recordImgs: updImgs
                    }
                });
            })
        })
    }

    handleEvaluation(id: number, forLike: boolean) {
        const record = this.state.recordJsons.find((rec: IRecord) => rec.id === id);
        if (record === undefined) {
            console.log("record to like is undefined, id = " + id)
            return;
        }

        const handleStateUpdate = (updRecord: IRecord) => {
            this.setState(oldState => {
                const index: number = oldState.recordJsons.findIndex(rec => rec.publisher === updRecord.publisher && rec.id === updRecord.id);
                let updRecJsons: Array<IRecord> = [...oldState.recordJsons];
                updRecJsons[index] = updRecord;
                return {
                    ...oldState,
                    recordJsons: updRecJsons
                }
            })
        }

        genericHandleEvaluation(record, forLike, this.props.authProvider.getAuth(), handleStateUpdate);
    }

    componentDidUpdate(prevProps: Readonly<IProps>) {
        if (prevProps.location.search !== this.props.location.search) {
            this.setState({
                recordJsons: [],
                recordImgs: new Map(),
                currPage: 0,
                numPages: undefined
            }, this.componentDidMount);
        }
    }

    render() {
        if (this.state.numPages === 0) {
            if (this.props.previewContext === RecordPreviewContext.RECOMMENDATION) {
                return (<div className={"container"}>
                    <p>
                        No recommendations for you as of this moment.<br/>
                        Try evaluating other user's records.
                    </p>
                </div>);
            }
            if (this.props.previewContext === RecordPreviewContext.SEARCH) {
                return (<div className={"container"}>
                    <p>
                        No records found for your query.
                    </p>
                </div>);
            }
            if (this.props.previewContext === RecordPreviewContext.PUBLISHER_RECORDS) {
                return (<div className={"container"}>
                    <p>
                        This user is yet to publish his (her) first record.
                    </p>
                </div>);
            }
        }

        const records = this.state.recordJsons.map((r: IRecord) =>
            <RecordCard key={r.publisher + r.id} {...{
                ...r, image: this.state.recordImgs.get(JSON.stringify({publisher: r.publisher, recOwnId: r.id})),
                handleEvaluation: this.handleEvaluation,
            }}/>
        )

        const pagination = (this.state.numPages && <ReactPaginate pageCount={this.state.numPages}
                                                                  pageRangeDisplayed={3}
                                                                  marginPagesDisplayed={2}
                                                                  onPageChange={this.handlePageChange}
                                                                  containerClassName={"react-paginate"}
                                                                  pageClassName={"px-2"}
                                                                  activeClassName={"active"}
                                                                  disabledClassName={"disabled"}
                                                                  previousClassName={"mr-2"}
                                                                  nextClassName={"ml-2"}
        />)

        return (<Container>
            <Row><h3>{previewContextCaptions.get(this.props.previewContext)}</h3></Row>
            <Row>{records}</Row>
            <Row>{pagination}</Row>
        </Container>)
    }


    handlePageChange(event: { selected: number }) {
        console.log(event.selected)
        this.setState((oldState) => {
            return {...oldState, currPage: event.selected}
        }, () => {
            this.loadCurrentPage();
            window.scrollTo(0, 0);
        });
    }
}

export {RecordPreviewContext};
export type {IRecord};
export default withRouter(RecordsPreviewPage);