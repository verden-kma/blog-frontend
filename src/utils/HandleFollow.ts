import axios from "axios";
import {IAuth} from "../cms_backbone/CMSNavbarRouting";

interface IPublisherFollow {
    publisherName: string,
    isFollowed: boolean,
    followers: number
}

function handleFollow(publisher: IPublisherFollow, auth: IAuth, setStateCB: (updPubl: IPublisherFollow) => void) {
    axios(
        {
            method: publisher.isFollowed ? "delete" : "put",
            url: `http://localhost:8080/users/${publisher.publisherName}/followers`,
            headers: {'Authorization': `Bearer ${auth.token}`}
        }
    ).then(success => {
        let updPubl: IPublisherFollow = {...publisher};
        publisher.isFollowed ? updPubl.followers-- : updPubl.followers++;
        updPubl.isFollowed = !publisher.isFollowed;
        setStateCB(updPubl);
    }, error => console.log(error));
}

export default handleFollow;
export type {IPublisherFollow};