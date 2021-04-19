import React from 'react';
import {RouteComponentProps, withRouter} from "react-router";
import axios, {AxiosResponse} from "axios";

interface IState {
    hasConfirmed: boolean,
    username?: string,
    email?: string,
    hasFailed: boolean,
    errorMessage?: string
}

interface ISignupResponse {
    username: string,
    email: string
}

class ConfirmRegistration extends React.Component<RouteComponentProps<any>, IState> {
    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            hasConfirmed: false,
            hasFailed: false
        }
    }

    componentDidMount() {
        const token = this.props.match.params.token;
        axios.post(`http://localhost:8080/users/confirm/${token}`)
            .then((succ: AxiosResponse<ISignupResponse>) => this.setState({
                hasConfirmed: true,
                username: succ.data.username,
                email: succ.data.email
            }), error => this.setState({hasFailed: true, errorMessage: error.response.data}))
    }

    render() {
        if (this.state.hasConfirmed) {
            return (
                <div>
                    <h3>Congratulations, {this.state.username}</h3>
                    <p>By activating your account via <span>'{this.state.email}'</span>&nbsp;
                        you have completed registration to Sprout.</p>
                </div>
            )
        }
        if (this.state.hasFailed) {
            return (
                <div>
                    <h3>Error has occurred!</h3>
                    <p>{this.state.errorMessage}</p>
                </div>
            );
        }
        return (<div/>)
    }
}

export default withRouter(ConfirmRegistration);