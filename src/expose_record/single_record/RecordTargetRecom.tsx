import React from 'react';
import {IAuthProvider} from "../../cms_backbone/CMSNavbarRouting";
import axios, {AxiosResponse} from "axios";
import {Image} from "react-bootstrap";
import {Link} from "react-router-dom";

interface IProps {
    authProvider: IAuthProvider,
    publisher: string,
    recordId: number
}

interface IRecordId {
    publisher: string,
    recordOwnId: number
}

interface IState {
    recordIcons: Map<IRecordId, string>,
}

class RecordTargetRecom extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            recordIcons: new Map()
        }
    }

    componentDidMount() {
        axios.get(`http://localhost:8080/recommendations/evaluations/${this.props.publisher}/${this.props.recordId}`,
            {headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`}})
            .then((success: AxiosResponse<Array<IRecordId>>) => success.data.forEach(recId => {
                axios.get(`http://localhost:8080/users/${recId.publisher}/records/${recId.recordOwnId}/image-icon`,
                    {
                        responseType: "arraybuffer",
                        headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`}
                    })
                    .then(imageResp => {
                        const image = Buffer.from(imageResp.data, 'binary').toString('base64');
                        this.setState(oldState => {
                            let updRecIcons = new Map(oldState.recordIcons);
                            updRecIcons.set(recId, image);
                            return {recordIcons: updRecIcons};
                        })
                    }, error => console.log(error));
            }), error => console.log(error));
    }

    render() {
        if (this.state.recordIcons.size === 0) return (<div>
            <h4>Evaluate other users' records to get recommendations.</h4>
        </div>);

        const recommThumbnails = Array.from(this.state.recordIcons).map(([recId, img]) =>
            <Link to={`/users/${recId.publisher}/records/${recId.recordOwnId}`}
                  key={JSON.stringify({publisher: recId.publisher, rOwnId: recId.recordOwnId})}>
                <Image src={"data:image/jpeg;base64, " + img} alt={"recommendation"}/>
            </Link>
        )

        return (
            <div>
                <h3>You may also like these</h3>
                {recommThumbnails}
            </div>
        );
    }
}

export default RecordTargetRecom;