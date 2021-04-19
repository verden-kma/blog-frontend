import React from "react";
import {monthNames} from "../../cms_backbone/CMSNavbarRouting";
import {IComment} from "./FullRecordView";
import defaultAva from "../../assets/defaultAvatar.png";
import {Link} from "react-router-dom";

interface IProps {
    comment: IComment;
    deleteCB?: () => void;
}

function Comment(props: IProps) {
    const date = new Date(props.comment.timestamp);
    const ava = props.comment.commenterAva ? 'data:image/jpeg;base64, ' + props.comment.commenterAva : defaultAva;
    return (<div className={"col-sm-10 col-md-8 col-lg-7 my-3 p-3"} style={{
        border: "2px dotted black"
    }}>
        <div className={"d-flex align-items-center"}>
            <div>
                <img width={75} height={75} src={ava} alt={`${props.comment.commentator}-ava`}/>
                <Link to={`/profile/${props.comment.commentator}`}>
                    <span className={"mx-4"} style={{
                        fontSize: 24
                    }}>{props.comment.commentator}</span>
                </Link>
            </div>

            <div className={"d-flex justify-content-end"} style={{
                flexGrow: 1
            }}>
                <div className={"d-flex flex-column flex-end m-2"}>
                    {props.deleteCB && <div onClick={props.deleteCB} style={{
                        cursor: "pointer",
                        alignSelf: "flex-end"
                    }}>×</div>}
                    <span>{date.getDate() + ' ' + monthNames[date.getMonth()] + ", " + date.getFullYear()}</span>
                </div>
            </div>

        </div>
        <hr/>
        <p className={"my-3"}>{props.comment.text}</p>
    </div>)
}

export default Comment;