import React from "react";

function MainPage() {
    return (
        <div className={"container-fluid"}>
            <div className={"row"}>
                <span className={"col d-flex justify-content-center faculty-name"}>ФСНСТ</span>
                <span className={"col d-flex justify-content-center faculty-name"}>ФІ</span>
            </div>
            <div className={"row"}>
                <span id={"handshake"} className={"col d-flex justify-content-center"}>🤝</span>
            </div>
            <div className={"row"}>
                <span className={"col d-flex justify-content-center trap"}>це займе у вас 10-15 хвилин</span>
            </div>
            <div className={"row"}>
                <a href={"https://forms.gle/Cgf6uZEytNegJs4L9"} target={"_blank"} rel="noreferrer"
                   className={"col d-flex justify-content-center"}>Анкета про потреби студентів НаУКМА в умовах
                    дистанційного навчання</a>
            </div>
        </div>
    );
}

export default MainPage;