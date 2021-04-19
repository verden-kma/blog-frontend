import React from 'react';
import defaultAvatar from "../../assets/defaultAvatar.png"
import {IAuthProvider} from "../../cms_backbone/CMSNavbarRouting";
import {IMiniRecord} from "../../digest/Digest";
import Thumbnail from "../../digest/Thumbnail";
import {Link} from "react-router-dom";

interface IProps {
    authProvider: IAuthProvider,
    publisher: string,
    publisherAva?: string,
    publisherBanner?: string,
    followers: number,
    uploads: number,
    isFollowed: boolean,
    lastRecords?: Array<IMiniRecord>,

    followCallback(publisher: string): void
}

class PublisherCard extends React.Component<IProps, any> {
    render() {
        const ava = this.props.publisherAva ? "data:image/jpeg;base64, " + this.props.publisherAva : defaultAvatar;
        const recordCards = this.props.lastRecords === undefined ? [] : this.props.lastRecords
            .map((recData: IMiniRecord) => <div style={{flexGrow: 1}}>
                <Thumbnail authProvider={this.props.authProvider} data={recData}/>
            </div>);

        return (
            <div className={"m-3 p-2 border border-secondary col-sm-5 col-md-4 col-lg-3"}>
                <img src={ava} alt={`${this.props.publisher}-ava`}/>
                <Link to={`/profile/${this.props.publisher}`}><h3>{this.props.publisher}</h3></Link>
                {this.props.publisherBanner && <img src={"data:image/jpeg;base64, " + this.props.publisherBanner}
                                                    alt={`${this.props.publisherBanner}-banner`}/>}
                {this.props.lastRecords && <div className={"d-flex"}>
                    {recordCards}
                </div>}
                <div>
                    <h5>Uploads: {this.props.uploads}</h5>
                    <h5>Followers: {this.props.followers}</h5>
                </div>
                {this.props.authProvider.getAuth().username !== this.props.publisher &&
                <button className={"follow-btn"} onClick={this.props.followCallback.bind(this, this.props.publisher)}>
                    {this.props.isFollowed ? "Unfollow" : "Follow"}
                </button>}
            </div>
        );
    }
}

export default PublisherCard;