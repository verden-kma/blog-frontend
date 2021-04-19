import React from 'react';
import {IAuthProvider} from "../../cms_backbone/CMSNavbarRouting";
import {
    Button,
    Container,
    DropdownButton,
    Form,
    FormControl,
    FormFile,
    FormGroup,
    FormLabel,
    Row
} from "react-bootstrap";
import axios from "axios";
import {Redirect} from "react-router";
import DropdownItem from "react-bootstrap/DropdownItem";

interface IState {
    oldStatus?: string,
    oldDescription?: string,

    newStatus?: string,
    newDescription?: string,

    newAvatar?: File,
    newBanner?: File,

    avatarUpdateMode: AlterOptions,
    bannerUpdateMode: AlterOptions,

    isEditing: boolean,
    hasEdited: boolean
}

enum AlterOptions {
    SKIP = "<none>",
    UPDATE = "update",
    DELETE = "delete"
}

const alterOptionsReverse: Map<string, AlterOptions> = new Map([
    ["<none>", AlterOptions.SKIP],
    ["update", AlterOptions.UPDATE],
    ["delete", AlterOptions.DELETE]
])


class EditUserProfile extends React.Component<IAuthProvider, IState> {
    constructor(props: IAuthProvider) {
        super(props);
        this.state = {
            avatarUpdateMode: AlterOptions.SKIP,
            bannerUpdateMode: AlterOptions.SKIP,
            isEditing: false,
            hasEdited: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.resetOld = this.resetOld.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.updateImage = this.updateImage.bind(this);
        this.handleAlterModeChange = this.handleAlterModeChange.bind(this);
    }

    componentDidMount() {
        axios.get(`http://localhost:8080/users/${this.props.getAuth().username}`, {
            headers: {'Authorization': `Bearer ${this.props.getAuth().token}`}
        }).then(success => {
            this.setState({
                oldStatus: success.data.status,
                newStatus: success.data.status,
                oldDescription: success.data.description,
                newDescription: success.data.description
            });
        }, error => console.log(error))
    }

    resetOld(property: string) {
        let newProp: string, oldVal: string;
        if (property === "status") {
            newProp = "newStatus";
            oldVal = this.state.oldStatus || "";
        } else if (property === "description") {
            newProp = "newDescription";
            oldVal = this.state.oldDescription || "";
        }
        this.setState(oldState => ({...oldState, [newProp]: oldVal}));
    }

    handleChange(event: React.ChangeEvent<any>) {
        const {name, value, type} = event.target;
        if (type === "file") this.setState(oldState => ({...oldState, [name]: event.target.files[0]}));
        else this.setState(oldState => ({...oldState, [name]: value}));
    }

    handleUpdate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        let updatePromises: Array<Promise<any> | undefined> = [];

        let textUpdate: any = {};
        if (this.state.newStatus !== this.state.oldStatus) {
            textUpdate.status = this.state.newStatus;
        }
        if (this.state.newDescription !== this.state.oldDescription) {
            textUpdate.description = this.state.newDescription;
        }
        if (Object.keys(textUpdate).length > 0) {
            const textPromise: Promise<any> =
                axios.patch(`http://localhost:8080/users/details`, textUpdate, {
                    headers: {'Authorization': `Bearer ${this.props.getAuth().token}`}
                }).then(() => {
                }, error => console.log(error));
            updatePromises.push(textPromise);
        }

        const avatarPromise: Promise<any> | undefined = this.updateImage(this.state.avatarUpdateMode, 'avatar', this.state.newAvatar);
        const bannerPromise: Promise<any> | undefined = this.updateImage(this.state.bannerUpdateMode, 'top-banner', this.state.newBanner);

        updatePromises.push(avatarPromise);
        updatePromises.push(bannerPromise);

        Promise.all(updatePromises).then(() => this.setState(oldState => ({...oldState, hasEdited: true})));
    }

    updateImage(mode: AlterOptions, urlSuffix: string, newImage?: File): Promise<any> | undefined {
        if (mode === AlterOptions.DELETE) {
            return axios.delete(`http://localhost:8080/users/${urlSuffix}`,
                {
                    headers: {'Authorization': `Bearer ${this.props.getAuth().token}`}
                }).then(() => {
            }, error => console.log(error))
        } else if (mode === AlterOptions.UPDATE && newImage !== undefined) {
            let body = new FormData();
            body.append("image", newImage);
            return axios.put(`http://localhost:8080/users/${urlSuffix}`, body, {
                headers: {'Authorization': `Bearer ${this.props.getAuth().token}`}
            }).then(() => {
            }, error => console.log(error))
        }
    }

    handleAlterModeChange(target: string, value: string | null) {
        if (value === null) return;
        this.setState(oldState => ({...oldState, [target]: alterOptionsReverse.get(value)}));
    }

    render() {
        if (this.state.hasEdited) {
            return <Redirect to={`/profile/${this.props.getAuth().username}`}/>
        }
        return (
            <Container>
                <Row className={"justify-content-center my-3"}>
                    <h3>Edit your profile data</h3>
                </Row>

                <Form onSubmit={this.handleUpdate}>
                    <FormGroup className={"my-5"}>
                        <FormLabel>Edit status:</FormLabel>
                        <FormControl name={"newStatus"} type={"text"} value={this.state.newStatus}
                                     onChange={this.handleChange}/>
                        <Button onClick={this.resetOld.bind(this, "status")} variant={"light"}
                                className={"float-right btn-outline-danger my-1 mx-3"}>
                            Restore current
                        </Button>
                    </FormGroup>

                    <FormGroup className={"my-5"}>
                        <FormLabel>Edit description:</FormLabel>
                        <FormControl name={"newDescription"} type={"text"} as={"textarea"}
                                     value={this.state.newDescription}
                                     onChange={this.handleChange}/>
                        <Button onClick={this.resetOld.bind(this, "description")} variant={"light"}
                                className={"float-right btn-outline-danger my-1 mx-3"}>
                            Restore current
                        </Button>
                    </FormGroup>

                    <div className={"d-flex justify-content-around"}>
                        <FormGroup>
                            <FormLabel>Alter avatar:</FormLabel>
                            <DropdownButton variant={"info"} title={this.state.avatarUpdateMode}>
                                <DropdownItem eventKey={AlterOptions.SKIP}
                                              onSelect={(key) => this.handleAlterModeChange("avatarUpdateMode", key)}>
                                    {AlterOptions.SKIP}
                                </DropdownItem>
                                <DropdownItem eventKey={AlterOptions.UPDATE}
                                              onSelect={(key) => this.handleAlterModeChange("avatarUpdateMode", key)}>
                                    {AlterOptions.UPDATE}
                                </DropdownItem>
                                <DropdownItem eventKey={AlterOptions.DELETE}
                                              onSelect={(key) => this.handleAlterModeChange("avatarUpdateMode", key)}>
                                    {AlterOptions.DELETE}
                                </DropdownItem>
                            </DropdownButton>
                            {this.state.avatarUpdateMode === AlterOptions.UPDATE
                            && <FormFile name={"newAvatar"} label={"New avatar:"}
                                         accept={".jpg,.jpeg,.png"}
                                         onChange={this.handleChange}/>}
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>Alter banner:</FormLabel>
                            <DropdownButton variant={"info"} title={this.state.bannerUpdateMode}>
                                <DropdownItem eventKey={AlterOptions.SKIP}
                                              onSelect={(key) => this.handleAlterModeChange("bannerUpdateMode", key)}>
                                    {AlterOptions.SKIP}
                                </DropdownItem>
                                <DropdownItem eventKey={AlterOptions.UPDATE}
                                              onSelect={(key) => this.handleAlterModeChange("bannerUpdateMode", key)}>
                                    {AlterOptions.UPDATE}
                                </DropdownItem>
                                <DropdownItem eventKey={AlterOptions.DELETE}
                                              onSelect={(key) => this.handleAlterModeChange("bannerUpdateMode", key)}>
                                    {AlterOptions.DELETE}
                                </DropdownItem>
                            </DropdownButton>
                            {this.state.bannerUpdateMode === AlterOptions.UPDATE
                            && <FormFile name={"newBanner"} label={"New banner:"}
                                         accept={".jpg,.jpeg,.png"}
                                         onChange={this.handleChange}/>}
                        </FormGroup>
                    </div>

                    <Row className={"justify-content-center mt-3"}>
                        <Button variant={"success"} type={"submit"}>Edit my profile</Button>
                    </Row>
                </Form>
            </Container>
        );
    }
}

export default EditUserProfile;