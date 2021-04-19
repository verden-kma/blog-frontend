import React from "react";
import "./local-styles.css"
import 'bootstrap/dist/css/bootstrap.css';

function Footer() {
    return (
        <footer id={"footer"}>
            <div id={"footer-content"} className={"m-3 d-flex justify-content-around"}>
                <h3>Developed for UKMA</h3>
                <a href={"mailto: sprout.mail.sender@gmail.com"}>Report bugs</a>
            </div>
        </footer>
    )
}

export default Footer;