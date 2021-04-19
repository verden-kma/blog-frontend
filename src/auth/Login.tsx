import React from "react";
import {withRouter} from "react-router-dom";
import axios, {AxiosResponse} from "axios";
import store from "store2";
import {Button, ButtonGroup, Container, Form, FormControl, FormGroup, FormLabel, Row, Spinner} from "react-bootstrap";
import "./auth-styles.css"

interface IState {
    username: string,
    password: string,
    loginRequested: boolean
}

interface LoginResponse {
    token: string,
    expiration: number,
    permissions: Array<string>
}

class Login extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            username: "",
            password: "",
            loginRequested: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.switchToRegister = this.switchToRegister.bind(this);
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target;
        this.setState(current => ({...current, [name]: value}));
    }

    handleLogin(event: React.FormEvent) {
        event.preventDefault();
        this.setState({loginRequested: true})
        axios.post("http://localhost:8080/login", {
            username: this.state.username,
            password: this.state.password
        }).then((response: AxiosResponse<LoginResponse>) => {
            store.session.set('username', this.state.username)
            store.session.set('token', response.data.token)
            store.session.set('isAuthorized', true);
            store.session.set('expiration', response.data.expiration);

            let {from} = this.props.location.state || {from: {pathname: "/"}};
            this.props.history.replace(from);
        }, (error) => {
            this.setState({loginRequested: false})
            alert("wrong credentials ")
            console.log(error)
        })
    }

    switchToRegister() {
        this.props.history.push("/register");
    }

    render() {
        return (
            <Container fluid className={"full-page-container"}>
                <Row className={"justify-content-md-center"}>
                    <div className={"col-sm-7 col-md-5 col-lg-4 m-3"}>
                        <div className={"d-flex justify-content-center"}>
                            <span>SPROUT</span>
                        </div>
                    </div>
                </Row>

                <Row className={"justify-content-center m-3"}>
                    <div className={"col-md-5"}>
                        <div className={"d-flex justify-content-center"}>
                            <span>Brace yourself. I hate css.</span>
                        </div>
                    </div>
                </Row>

                <Row className="justify-content-center">
                    <div className={"col-sm-7 col-md-5 col-lg-4"}>
                        <Form onSubmit={this.handleLogin}>
                            <FormGroup>
                                <FormLabel>Username:</FormLabel>
                                <FormControl type={"text"}
                                             name={"username"}
                                             value={this.state.username}
                                             onChange={this.handleChange}/>
                            </FormGroup>
                            <FormGroup>
                                <FormLabel>Password:</FormLabel>
                                <FormControl type={"password"}
                                             name={"password"}
                                             value={this.state.password}
                                             onChange={this.handleChange}/>
                            </FormGroup>
                            <ButtonGroup className={"d-flex justify-content-around"}>
                                <Button type={"submit"} variant={"info"}>
                                    {this.state.loginRequested &&
                                    <Spinner as={"span"} animation={"border"} size={"sm"} role={"status"}
                                             aria-hidden={"true"}/>}
                                    Log in
                                </Button>
                                <Button type={"button"} variant={"dark"} onClick={this.switchToRegister}>Create
                                    account</Button>
                            </ButtonGroup>
                        </Form>
                    </div>
                </Row>
            </Container>
        )
    }
}


export default withRouter(Login);