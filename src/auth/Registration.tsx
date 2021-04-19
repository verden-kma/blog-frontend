import React from "react";
import axios from "axios";
import {withRouter} from "react-router-dom"
import {
    Button,
    ButtonGroup,
    Container,
    Form,
    FormControl,
    FormGroup,
    FormLabel,
    Modal,
    Row,
    Spinner
} from "react-bootstrap";

interface IState {
    email: string,
    username: string,
    password: string,
    passwordConfirm: string,
    status?: string,
    description?: string,
    hasSentRequest: boolean,
    hasRequestedSignup: boolean,
    requestIsDeclined: boolean,
    cause?: string
}

class Registration extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            email: "",
            username: "",
            password: "",
            passwordConfirm: "",
            status: "",
            description: "",
            hasSentRequest: false,
            hasRequestedSignup: false,
            requestIsDeclined: false
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.switchToLogin = this.switchToLogin.bind(this);
        this.handleFailedRequest = this.handleFailedRequest.bind(this);
    }

    handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (this.state.password !== this.state.passwordConfirm) {
            alert("error: passwords do not match!");
            return;
        }
        this.setState({hasSentRequest: true});
        axios.post("http://localhost:8080/users", {
            email: this.state.email,
            username: this.state.username,
            password: this.state.password,
            status: this.state.status,
            description: this.state.description
        }).then(() => {
            this.setState({hasSentRequest: false, hasRequestedSignup: true});
        }, (error) => {
            this.setState({hasSentRequest: false, requestIsDeclined: true, cause: error.response.data});
            console.log("failed to register, status: " + error.response.status);
        })
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target;
        this.setState(oldState => ({...oldState, [name]: value}));
    }

    handleFailedRequest() {
        this.setState({requestIsDeclined: false, cause: undefined})
    }

    switchToLogin() {
        this.props.history.push("/login");
    }

    render() {
        return (<div>
                <Modal size={"sm"} show={this.state.hasRequestedSignup} onHide={this.switchToLogin}>
                    <Modal.Header closeButton>
                        <Modal.Title>Congratulations! Your personal data has been accepted.</Modal.Title>
                    </Modal.Header>
                    <Modal.Body><p>In order to get full access to your Sprout account confirm
                        your email by following the link in the letter we have sent you.</p>
                    </Modal.Body>

                </Modal>
                <Modal size={"sm"} show={this.state.requestIsDeclined} onHide={this.handleFailedRequest}>
                    <Modal.Header closeButton>
                        <Modal.Title>Your registration request has been rejected.</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.state.cause}</Modal.Body>
                </Modal>
                <Container fluid className={"full-page-container"}>

                    <Row className={"justify-content-center"}>
                        <div className={"col-sm-7 col-md-5 col-lg-4 m-3"}>
                            <div className={"d-flex justify-content-center"}>
                                <span>Registration</span>
                            </div>
                        </div>
                    </Row>

                    <Row className={"justify-content-center"}>
                        <div className={"col-sm-7 col-md-5 col-lg-4"}>
                            <Form onSubmit={this.handleSubmit}>
                                <FormGroup>
                                    <FormLabel>Email:</FormLabel>
                                    <FormControl type={"email"} name={"email"} onChange={this.handleChange} required/>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel>Username:</FormLabel>
                                    <FormControl type={"text"}
                                                 name={"username"}
                                                 onChange={this.handleChange}
                                                 required/>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel>Password:</FormLabel>
                                    <FormControl type={"password"}
                                                 name={"password"}
                                                 onChange={this.handleChange}
                                                 required/>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel>Confirm the password:</FormLabel>
                                    <FormControl type={"password"}
                                                 name={"passwordConfirm"}
                                                 onChange={this.handleChange}
                                                 required/>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel>Your status:</FormLabel>
                                    <FormControl type={"text"}
                                                 name={"status"}
                                                 onChange={this.handleChange}/>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel>Description (tell about yourself):</FormLabel>
                                    <FormControl type={"text"} as={"textarea"} name={"description"}
                                                 onChange={this.handleChange}/>
                                </FormGroup>
                                <ButtonGroup className={"d-flex justify-content-around"}>
                                    <Button type={"submit"} variant={"success"}>
                                        {this.state.hasSentRequest &&
                                        <Spinner as={"span"} animation={"border"} size={"sm"} role={"status"}
                                                 aria-hidden={"true"}/>}
                                        Register
                                    </Button>
                                    <Button type={"button"} variant={"secondary"} onClick={this.switchToLogin}>
                                        Already have an account
                                    </Button>
                                </ButtonGroup>

                            </Form>
                        </div>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default withRouter(Registration);