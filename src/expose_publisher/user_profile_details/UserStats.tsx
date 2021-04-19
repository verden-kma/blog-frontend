import React from 'react';
import axios, {AxiosResponse} from "axios";
import {IAuthProvider} from "../../cms_backbone/CMSNavbarRouting";
import defaultAva from "../../assets/defaultAvatar.png";
import handleFollow, {IPublisherFollow} from "../../utils/HandleFollow";
import "../publisher-styles.css"
import {Button} from "react-bootstrap";
import {Link} from "react-router-dom";

interface IProps {
    authProvider: IAuthProvider,
    targetUsername: string
}

interface IState {
    userData?: IUserData,
    userAva?: string,
    subsAvas: Map<string, string>
}

interface IUserData {
    username: string,
    status: string,
    description: string,
    uploads: number,
    followers: number,
    likes: number,
    dislikes: number,
    comments: number,
    isFollowed: boolean
}

class UserStats extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            subsAvas: new Map<string, string>()
        }
        this.handleFollowAction = this.handleFollowAction.bind(this);
    }

    handleFollowAction() {
        if (this.state.userData === undefined) {
            console.log("user data is undefined");
            return;
        }
        const pubFollowData: IPublisherFollow = {
            publisherName: this.state.userData.username,
            followers: this.state.userData.followers,
            isFollowed: this.state.userData.isFollowed
        }

        const updateStateCB = (updPublFlwData: IPublisherFollow) => {
            this.setState((oldState: IState) => {
                if (oldState.userData === undefined) return oldState;
                let updData: IUserData = {...oldState.userData};
                updData.isFollowed = updPublFlwData.isFollowed;
                updData.followers = updPublFlwData.followers;
                return {
                    ...oldState,
                    userData: updData
                }
            })
        }

        handleFollow(pubFollowData, this.props.authProvider.getAuth(), updateStateCB);
    }

    componentDidMount() {
        axios.get(`http://localhost:8080/users/${this.props.targetUsername}/avatar`, {
            responseType: 'arraybuffer',
            headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`}
        }).then(success => {
            if (success.data) {
                this.setState(oldState => ({
                    ...oldState,
                    userAva: Buffer.from(success.data, 'binary').toString('base64')
                }))
            }
        }, error => console.log(error));
        axios.get(`http://localhost:8080/users/${this.props.targetUsername}`, {
            headers: {'Authorization': `Bearer ${this.props.authProvider.getAuth().token}`}
        }).then((success: AxiosResponse<IUserData>) => {
            this.setState(oldState => ({...oldState, userData: success.data}))
        }, error => console.log(error));
    }

    render() {
        if (!this.state.userData) return (<div/>);
        const userAva = this.state.userAva ? 'data:image/jpeg;base64, ' + this.state.userAva : defaultAva;
        return (
            <div className={"my-5 mx-2"} style={{
                position: "sticky",
                top: "2em"
            }}>
                <div className={"vertical-flex"}>
                    <h3>{this.state.userData.username}</h3>
                    <img className={"my-3"} src={userAva} alt={`${this.props.targetUsername}'s avatar`}/>

                    <div>
                        <h4>{this.state.userData.status}</h4>
                        <p>{this.state.userData.description}</p>
                        <hr className={"publisher-stats-split"}/>
                        <h5>Uploads: {this.state.userData.uploads}</h5>
                        <h5>Likes: {this.state.userData.likes}</h5>
                        <h5>Dislikes: {this.state.userData.dislikes}</h5>
                        <h5>Comments: {this.state.userData.comments}</h5>
                        <h5>Followers: {this.state.userData.followers}</h5>

                        <hr className={"publisher-stats-split"}/>

                        <div className={"d-flex flex-column"}>
                            <Link to={`/users/${this.state.userData.username}/followers`}>
                                Show all followers
                            </Link>
                            <Link to={`/users/${this.state.userData.username}/subscriptions`}>
                                Show all subscriptions
                            </Link>
                        </div>

                        {this.props.targetUsername !== this.props.authProvider.getAuth().username &&
                        <div className={"vertical-flex"}>
                            <hr className={"publisher-stats-split"}/>
                            <div className={"follow-btn-wrapper"}>
                                <Button variant={"dark"} className={"follow-btn"} onClick={this.handleFollowAction}>
                                    {this.state.userData.isFollowed ? "Unfollow" : "Follow"}
                                </Button>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        );
    }
}

export default UserStats;