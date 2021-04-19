import React from 'react';
import {IAuthProvider, monthNames} from "../../cms_backbone/CMSNavbarRouting";
import {Redirect, RouteComponentProps, withRouter} from "react-router";
import axios, {AxiosResponse} from "axios";
import {IRecord} from "../multiple_records/RecordsPreviewPage";
import {Badge, Button, Container, Form, FormControl, FormGroup, FormLabel, Image, Row} from "react-bootstrap";

interface IProps extends RouteComponentProps<any> {
    authProvider: IAuthProvider
}

interface IState {
    currCaption?: string,
    currAdText?: string,
    image?: string,
    isAlreadyEdited?: boolean,
    timestamp?: string,
    newCaption: string,
    newAdText: string
    redirectRequested: boolean
}

class EditRecord extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            newCaption: "",
            newAdText: "",
            redirectRequested: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleRestore = this.handleRestore.bind(this);
    }

    componentDidMount() {
        axios.get(`http://localhost:8080/users/${this.props.authProvider.getAuth().username}/records/${this.props.match.params.recordId}`, {
            headers: {Authorization: `Bearer ${this.props.authProvider.getAuth().token}`}
        }).then((success: AxiosResponse<IRecord>) => {
            const record = success.data;
            this.setState({
                currCaption: record.caption,
                currAdText: record.adText || undefined,
                isAlreadyEdited: record.isEdited,
                timestamp: record.timestamp,
                newCaption: record.caption,
                newAdText: record.adText || ""
            })
        });

        axios.get(`http://localhost:8080/users/${this.props.authProvider.getAuth().username}/records/${this.props.match.params.recordId}/image-min`, {
            headers: {Authorization: `Bearer ${this.props.authProvider.getAuth().token}`},
            responseType: "arraybuffer"
        }).then(success => {
            const imageStr = Buffer.from(success.data, 'binary').toString('base64');
            this.setState({image: imageStr});
        }, error => console.log("failed to load image"));
    }

    handleChange(event: React.ChangeEvent<any>) {
        const {name, value} = event.target;
        this.setState(oldState => ({...oldState, [name]: value}));
    }

    handleSubmit(event: React.MouseEvent<HTMLElement>) {
        event.preventDefault();
        axios.patch(`http://localhost:8080/users/${this.props.authProvider.getAuth().username}/records/${this.props.match.params.recordId}`, {
                caption: this.state.newCaption,
                adText: this.state.newAdText
            }, {headers: {Authorization: `Bearer ${this.props.authProvider.getAuth().token}`}}
        ).then(() => this.setState({redirectRequested: true}), error => alert(error));
    }

    handleRestore() {
        if (this.state.currCaption === undefined) return;
        const currCaption = this.state.currCaption;
        const currAdText = this.state.currAdText || "";
        this.setState({newCaption: currCaption, newAdText: currAdText});
    }

    render() {
        if (this.state.currCaption === undefined || this.state.timestamp === undefined) return <div/>
        if (this.state.redirectRequested) {
            const {publisher, recordId} = this.props.match.params;
            return <Redirect to={`/users/${publisher}/records/${recordId}`}/>
        }

        let badgeVar, badgeText;
        if (this.state.isAlreadyEdited) {
            badgeVar = "info";
            badgeText = "This record has already been edited.";
        } else {
            badgeVar = "warning";
            badgeText = "This record is still untouched!"
        }
        const date: Date = new Date(this.state.timestamp);

        return (
            <Container className={"my-5"}>
                <Row className={"justify-content-center"}>
                    <h3>Edit '<span style={{fontStyle: "italic"}}>{this.state.currCaption}</span>'</h3>
                </Row>
                <Row>
                    <Badge variant={badgeVar}>{badgeText}</Badge>
                    <Badge
                        variant={"second"}>{date.getDate() + ' ' + monthNames[date.getMonth()] + ", " + date.getFullYear()}
                    </Badge>
                </Row>
                <Row className={"justify-content-center"}>
                    <Image style={{
                        maxWidth: "100%",
                        height: "auto",
                        objectFit: "contain"
                    }} src={"data:image/jpeg;base64, " + this.state.image} alt={"no image loaded"} thumbnail/>
                </Row>
                <Form>
                    <FormGroup>
                        <FormLabel>Caption:</FormLabel>
                        <FormControl type={"text"} name={"newCaption"} value={this.state.newCaption}
                                     onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>AdText:</FormLabel>
                        <FormControl type={"text"} name={"newAdText"} value={this.state.newAdText}
                                     onChange={this.handleChange}/>
                    </FormGroup>
                    <div className={"d-flex justify-content-around"}>
                        <Button type={"submit"} onClick={this.handleSubmit}>Update</Button>
                        <Button type={"button"} onClick={this.handleRestore}>Restore</Button>
                        <Button type={"button"} onClick={() => this.setState({redirectRequested: true})}>
                            Cancel
                        </Button>
                    </div>
                </Form>
            </Container>
        );
    }
}

export default withRouter(EditRecord);