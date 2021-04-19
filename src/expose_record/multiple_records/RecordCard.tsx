import React from "react";
import {IRecord} from "./RecordsPreviewPage";
import {monthNames} from "../../cms_backbone/CMSNavbarRouting";
import {Link} from "react-router-dom";
import {Button, Container, Image, Row} from "react-bootstrap";
import "../record-styles.css"

interface ICardProps extends IRecord {
    image?: string,

    handleEvaluation(id: number, forLike: boolean): void
}

class RecordCard extends React.Component<ICardProps, any> {

    render() {
        const activeStyle = {fontWeight: "bold"};
        const ls = (this.props.reaction !== null && this.props.reaction) ? activeStyle : {};
        const dls = (this.props.reaction !== null && !this.props.reaction) ? activeStyle : {};

        const date: Date = new Date(this.props.timestamp);

        return (<Container fluid className={"my-5 record-card"}>
            <Row className={"mx-3"}>
                <div className={"record-card-title"}>
                    <span className={"mx-3 my-1"}>{this.props.caption}</span>
                </div>
                <div className={"record-card-upper-preview"}>
                    <span>{date.getDate() + ' ' + monthNames[date.getMonth()] + ", " + date.getFullYear()}</span>
                    {this.props.isEdited && <span>edited</span>}
                </div>
            </Row>
            <Row>
                <div className={"col-12"}>
                    <Link to={`/users/${this.props.publisher}/records/${this.props.id}`}>
                        <Image width={"100%"} src={'data:image/jpeg;base64, ' + this.props.image}
                               alt={this.props.caption}/>
                    </Link>
                </div>
            </Row>

            <Row>
                <div className={"record-card-footer-buttons"}>
                    <Button variant={"dark"} className={"ml-3 mr-1 my-1 btn-outline-success"} style={ls}
                            onClick={() => this.props.handleEvaluation(this.props.id, true)}>Like {this.props.likes}
                    </Button>
                    <Button variant={"dark"} className={"mr-3 ml-1 my-1 btn-outline-danger"} style={dls}
                            onClick={() => this.props.handleEvaluation(this.props.id, false)}>Dislike {this.props.dislikes}
                    </Button>
                </div>
                <div className={"record-card-footer-comment-wrapper"}>
                    <div className={"mx-3 record-card-footer-comment"}>
                        <span>Comments: {this.props.numOfComments}</span>
                    </div>
                </div>
            </Row>
        </Container>)
    }

}

export default RecordCard;