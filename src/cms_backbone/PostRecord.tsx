import React from "react";
import axios from "axios";
import {IAuthProvider} from "./CMSNavbarRouting";
import {
    Button,
    Container,
    Form,
    FormControl,
    FormFile,
    FormGroup,
    FormLabel,
    Image,
    Modal,
    ModalTitle,
    Row,
    Spinner
} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";

interface IState {
    caption: string,
    adText: string,
    file?: File,
    isBeingSent: boolean,
    uploadResult?: boolean,
    selectedFileName: string
}

class PostRecord extends React.Component<IAuthProvider, IState> {
    constructor(props: IAuthProvider) {
        super(props);
        this.state = {
            caption: "",
            adText: "",
            isBeingSent: false,
            selectedFileName: ""
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const {name, value, files} = event.target;
        if (files) this.setState({file: files[0]});
        this.setState(current => ({...current, [name]: value}))
    }

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (this.state.file === undefined) {
            alert("image should be specified");
            return;
        }

        const recordData = {
            caption: this.state.caption,
            adText: this.state.adText
        }

        let body = new FormData()
        body.append('image', this.state.file);
        body.append('recordData', new Blob([JSON.stringify(recordData)], {
            type: 'application/json'
        }))

        this.setState({isBeingSent: true});

        axios({
            method: 'post',
            url: `http://localhost:8080/users/${this.props.getAuth().username}/records`,
            data: body,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${this.props.getAuth().token}`
            }
        }).then(success => {
                this.setState({
                    caption: "",
                    adText: "",
                    file: undefined,
                    isBeingSent: false,
                    uploadResult: true,
                    selectedFileName: ""
                });
            },
            error => this.setState({
                isBeingSent: false, uploadResult: false
            }))
    }

    render() {
        return (
            <div>
                <Modal show={this.state.uploadResult !== undefined}
                       onHide={() => this.setState({uploadResult: undefined})}>
                    <ModalHeader closeButton>
                        <ModalTitle>
                            {this.state.uploadResult ? "Your record is successfully uploaded." : "Failed to upload your record."}
                        </ModalTitle>
                    </ModalHeader>
                </Modal>
                <Container>
                    {this.state.file && <Row className={"justify-content-center"}>
                        <div className={"col-8 d-flex justify-content-center"}>
                            <Image src={URL.createObjectURL(this.state.file)} alt={this.state.selectedFileName}
                                   thumbnail/>
                        </div>
                    </Row>}


                    <Row className={"justify-content-center"}>
                        <div className={"col-sm-8 col-md-6 col-lg-5"}>
                            <Form onSubmit={this.handleSubmit}>
                                <FormGroup>
                                    <FormLabel>Caption:</FormLabel>
                                    <FormControl type="text"
                                                 name="caption"
                                                 value={this.state.caption}
                                                 onChange={this.handleChange}
                                                 placeholder="this will be displayed as a title of your record"/>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel>Description:</FormLabel>
                                    <FormControl type="text" as={"textarea"}
                                                 name="adText"
                                                 value={this.state.adText}
                                                 onChange={this.handleChange}
                                                 placeholder="what else do you have to tell?"/>
                                </FormGroup>
                                <FormGroup className={"d-flex"}>
                                    <FormFile
                                        name={"selectedFileName"} value={this.state.selectedFileName}
                                        accept={".jpg,.jpeg,.png"}
                                        onChange={this.handleChange}
                                    />
                                </FormGroup>
                                <div className={"d-flex justify-content-center"}>
                                    <Button type="submit">
                                        {this.state.isBeingSent &&
                                        <Spinner animation={"border"} size={"sm"} role={"status"}/>}Upload
                                    </Button>
                                </div>

                            </Form>
                        </div>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default PostRecord;