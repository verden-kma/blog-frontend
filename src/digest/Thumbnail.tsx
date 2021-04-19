import React from 'react'
import axios from 'axios'
import {IAuthProvider} from "../cms_backbone/CMSNavbarRouting";
import {IMiniRecord} from "./Digest";

interface IProps {
    authProvider: IAuthProvider,
    data: IMiniRecord
}

interface IState {
    image?: string
}

class Thumbnail extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        axios.get(`http://localhost:8080/users/${this.props.data.publisher}/records/${this.props.data.recordOwnId}/image-min`,
            {
                responseType: 'arraybuffer',
                headers: {
                    'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`,
                    'Accept': 'image/jpeg'
                }
            }).then((response) => {
            this.setState({image: Buffer.from(response.data, 'binary').toString('base64')})
        }, (error) => console.log(error.response))
    }

    render() {
        return (
            // <div className={"col-sm-6 col-md-3 col-lg-2 p-0"}>
            <div className="digest-container">
                <a href={`/users/${this.props.data.publisher}/records/${this.props.data.recordOwnId}`}>
                    <img src={"data:image/jpeg;base64, " + this.state.image} alt={`${this.props.data.caption}`}/>
                </a>
            </div>
            // </div>
        )
    }
}

export default Thumbnail;