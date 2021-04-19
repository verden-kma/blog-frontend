import React from 'react';
import {IAuthProvider} from "../../cms_backbone/CMSNavbarRouting";
import {Button, Container, Form, Modal, Row} from "react-bootstrap";
import {RouteComponentProps, withRouter} from "react-router";
import axios from "axios";
import store from "store2"

interface IProps extends IAuthProvider, RouteComponentProps<any> {
}

interface IState {
    suggestedCurrPassword: string,
    newPassword: string,
    newPassRepeat: string,
    changeRequest: boolean,
    errors: Map<string, string>
}

class ChangePassword extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            suggestedCurrPassword: "",
            newPassword: "",
            newPassRepeat: "",
            changeRequest: false,
            errors: new Map()
        }
        this.handlePropertyChange = this.handlePropertyChange.bind(this);
        this.handleChangeRequest = this.handleChangeRequest.bind(this);
        this.handleCancelChange = this.handleCancelChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    handlePropertyChange(event: React.ChangeEvent<any>) {
        const {name, value} = event.target;
        this.setState(oldState => ({...oldState, [name]: value}));
    }

    handlePasswordChange() {
        const passUpd = {currentPassword: this.state.suggestedCurrPassword, newPassword: this.state.newPassword};
        axios.patch("http://localhost:8080/users/password", passUpd, {
            headers: {'Authorization': `Bearer ${this.props.getAuth().token}`}
        }).then(() => {
            store.session.clearAll();
            window.history.replaceState(null, "sprout", "/");
            window.location.reload();
        }, error => {
            if (error.response.status === 401) {
                let errorUpd = new Map();
                errorUpd.set("currPass", error.response.data);
                this.setState(oldState => ({...oldState, changeRequest: false, errors: errorUpd}));
            } else console.log(error.response);
        });
    }

    handleChangeRequest(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        let errorsUpd = new Map();
        const currPass = this.state.suggestedCurrPassword;
        if (currPass === undefined || currPass === null)
            errorsUpd.set("currPass", "current password is missing");
        else if (!currPass.match(/^[\w\d@$!%*#?&]{5,25}$/))
            errorsUpd.set("currPass", "password is malformed: use 5 to 25 alphanumeric chars only");

        const newPass = this.state.newPassword;
        if (newPass === undefined || newPass === null)
            errorsUpd.set("newPass", "new password is missing");
        else if (!newPass.match(/^[\w\d@$!%*#?&]{5,25}$/))
            errorsUpd.set("newPass", "password is malformed: use 5 to 25 alphanumeric chars only");

        const newPassMatch = this.state.newPassRepeat;
        if (newPassMatch === undefined || newPassMatch === null)
            errorsUpd.set("newPassMatch", "repeat your new password");
        if (newPass !== newPassMatch)
            errorsUpd.set("newPassMatch", "passwords do not match");

        if (errorsUpd.size === 0)
            this.setState(oldState => ({...oldState, changeRequest: true}));
        else this.setState(oldState => ({...oldState, errors: errorsUpd}));
    }

    handleCancelChange() {
        this.setState(oldState => ({...oldState, changeRequest: false}));
    }

    render() {
        return (
            <div>
                <Modal show={this.state.changeRequest} onHide={this.handleCancelChange}>
                    <Modal.Header closeButton>
                        <Modal.Title>Are you sure you want to change your current password?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>You will be logged out and will have to reenter the new password.</Modal.Body>
                    <Modal.Footer>
                        <Button variant={"primary"} onClick={this.handlePasswordChange}>yes</Button>
                    </Modal.Footer>
                </Modal>

                <Container>
                    <Row className={"justify-content-center mt-5 mb-3"}>
                        <h3>Change your password</h3>
                    </Row>
                    <Form onSubmit={this.handleChangeRequest}>
                        <Row className={"justify-content-center"}>
                            <div className={"col-sm-12 col-md-8 col-lg-6"}>
                                <Form.Group>
                                    <Form.Label>Confirm current password</Form.Label>
                                    <Form.Control name={"suggestedCurrPassword"} type={"password"}
                                                  value={this.state.suggestedCurrPassword}
                                                  onChange={this.handlePropertyChange}
                                                  isInvalid={!!this.state.errors.get("currPass")}/>
                                    <Form.Control.Feedback type={"invalid"}>
                                        {this.state.errors.get("currPass")}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>
                        </Row>

                        <Row className={"justify-content-center"}>
                            <div className={"col-sm-12 col-md-8 col-lg-6"}>
                                <Form.Group>
                                    <Form.Label>New password</Form.Label>
                                    <Form.Control name={"newPassword"} type={"password"} value={this.state.newPassword}
                                                  onChange={this.handlePropertyChange}
                                                  isInvalid={!!this.state.errors.get("newPass")}/>
                                    <Form.Control.Feedback type={"invalid"}>
                                        {this.state.errors.get("newPass")}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>
                        </Row>

                        <Row className={"justify-content-center"}>
                            <div className={"col-sm-12 col-md-8 col-lg-6"}>
                                <Form.Group>
                                    <Form.Label>Repeat new password</Form.Label>
                                    <Form.Control name={"newPassRepeat"} type={"password"}
                                                  value={this.state.newPassRepeat}
                                                  onChange={this.handlePropertyChange}
                                                  isInvalid={!!this.state.errors.get("newPassMatch")}/>
                                    <Form.Control.Feedback type={"invalid"}>
                                        {this.state.errors.get("newPassMatch")}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>
                        </Row>

                        <Row className={"justify-content-center"}>
                            <div>
                                <Button type={"submit"}>Apply</Button>
                            </div>
                        </Row>
                    </Form>
                </Container>
            </div>
        );
    }
}

export default withRouter(ChangePassword);