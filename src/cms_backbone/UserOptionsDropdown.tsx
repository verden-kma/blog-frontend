import React from 'react';
import NavDropdown from "react-bootstrap/NavDropdown";
import store from "store2"
import axios from "axios";
import {IAuth} from "./CMSNavbarRouting";

class UserOptionsDropdown extends React.Component<any, IAuth> {
    constructor(props: any) {
        super(props);
        this.state = {
            username: store.session.get("username"),
            token: store.session.get("token")
        }
        this.doLogout = this.doLogout.bind(this);
    }

    doLogout() {
        axios.post("http://localhost:8080/logout-invalidate", {}, {
            headers: {'Authorization': `Bearer ${this.state.token}`}
        }).then(() => {
            console.log("logged out on server");
            store.session.clearAll();
            window.location.reload();
        }, (error) => {
            alert("failed to log out" + error.data);
            store.session.clearAll();
            window.location.reload();
        });
    }

    render() {
        return (
            <NavDropdown style={{alignSelf: "center"}} title={this.state.username} id="user-options-navbar">
                <NavDropdown.Item href={`/profile/${this.state.username}`}>Profile</NavDropdown.Item>
                <NavDropdown.Item href={"/edit-user-details"}>Edit profile</NavDropdown.Item>
                <NavDropdown.Item href={"/change-password"}>Change password</NavDropdown.Item>
                <NavDropdown.Divider/>
                <NavDropdown.Item onClick={this.doLogout}>Log out</NavDropdown.Item>
            </NavDropdown>
        );
    }
}

export default UserOptionsDropdown;