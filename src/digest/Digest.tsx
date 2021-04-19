import React from "react";
import axios, {AxiosResponse} from 'axios'
import Thumbnail from "./Thumbnail";
import {IAuthProvider} from "../cms_backbone/CMSNavbarRouting";
import {Container, Row} from "react-bootstrap";

interface IState {
    records: Array<IMiniRecord>,
    nextPage: number,
    hasMorePages: boolean
}

interface IMiniRecord {
    publisher: string,
    recordOwnId: number,
    caption: string
}

interface ILazyRecordsPage {
    pageItems: Array<IMiniRecord>,
    isLast: boolean
}

class Digest extends React.Component<IAuthProvider, IState> {
    constructor(props: IAuthProvider) {
        super(props);
        this.state = {
            records: [],
            nextPage: 0,
            hasMorePages: true
        }
        this.loadNextPage = this.loadNextPage.bind(this);
    }

    componentDidMount() {
        this.loadNextPage();
    }

    loadNextPage() {
        axios.get('http://localhost:8080/digest', {
            params: {page: this.state.nextPage},
            headers: {'Authorization': `Bearer ${this.props.getAuth().token}`}
        }).then((response: AxiosResponse<ILazyRecordsPage>) => {
            this.setState(oldState => ({
                records: oldState.records.concat(response.data.pageItems),
                nextPage: oldState.nextPage + 1,
                hasMorePages: !response.data.isLast
            }))
        }, (error) => {
            console.log(error)
        })
    }

    render() {
        const thumbnails = this.state.records.map(record =>
            <div className={"col-sm-6 col-md-3 col-lg-2 p-0"}>
                <Thumbnail
                    key={record.publisher + "-" + record.recordOwnId}
                    authProvider={this.props}
                    data={record}/>
            </div>
        )

        return (
            <div>
                <Container fluid>
                    <Row>
                        {thumbnails}
                    </Row>
                </Container>
                {this.state.hasMorePages && <button onClick={this.loadNextPage}>load more</button>}
            </div>
        )
    }
}

export type {IMiniRecord};
export default Digest;