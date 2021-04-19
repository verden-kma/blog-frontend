import React from "react";
import {withRouter} from "react-router-dom";
import Search from "./Search";
import {RouteComponentProps} from "react-router";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import UserOptionsDropdown from "./UserOptionsDropdown";

interface IProps extends RouteComponentProps<any> {
    username: string
}

class Header extends React.Component<IProps, any> {
    render() {
        return (
            <header>
                <Navbar expand="lg">
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse>
                        <Nav className="mr-auto even-navbar">
                            <Navbar.Brand href={"/"}>Sprout</Navbar.Brand>
                            <div className={"d-flex"}>
                                <Nav.Link href={"/digest"} className={"mx-3"}>Digest</Nav.Link>
                                <Nav.Link href={"/publishers"} className={"mx-3"}>Recommended publishers</Nav.Link>
                                <Nav.Link href={"/records"} className={"mx-3"}>Recommended records</Nav.Link>
                                <Nav.Link href={"/post-record"} className={"mx-3"}>Post new record</Nav.Link>
                            </div>
                            <Search/>
                            <UserOptionsDropdown username={this.props.username}/>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </header>)
    }
}

export default withRouter(Header);