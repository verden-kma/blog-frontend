import axios from "axios";
import {IAuth} from "../cms_backbone/CMSNavbarRouting";
import {backendUrl} from "../constants";

interface IPublisherFollow {
    publisherName: string,
    isFollowed: boolean,
    followers: number
}

function handleFollow(publisher: IPublisherFollow, auth: IAuth, setStateCB: (updPubl: IPublisherFollow) => void) {
    axios(
        {
            method: publisher.isFollowed ? "delete" : "put",
            url: `${backendUrl}/users/${publisher.publisherName}/followers`,
            headers: {'Authorization': `Bearer ${auth.token}`}
        }
    ).then(() => {
        let updPubl: IPublisherFollow = {...publisher};
        publisher.isFollowed ? updPubl.followers-- : updPubl.followers++;
        updPubl.isFollowed = !publisher.isFollowed;
        setStateCB(updPubl);
    }, error => console.log(error));
}

export default handleFollow;
export type {IPublisherFollow};